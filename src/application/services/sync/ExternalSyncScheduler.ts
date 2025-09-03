import { ExternalSyncService } from "./ExternalSyncService";
import { debugLog } from "../../../infrastructure/logging/debugLog";

export class ExternalSyncScheduler {
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private started = false;
  private lastImagesSync: number | null = null;
  private pending = false;

  constructor(
    private readonly syncService: ExternalSyncService,
    private readonly intervalMs: number = 3600_000,
    private readonly options: { details?: boolean; images?: boolean } = {}
  ) {}

  private envFlag(name: string, fallback: boolean): boolean {
    const v = process.env[name];
    if (!v) return fallback;
    return v === "1" || v.toLowerCase() === "true";
  }

  private imagesDue(now: number): boolean {
    if (!(this.options.images ?? this.envFlag("SYNC_FETCH_IMAGES", true))) return false;
    if (this.lastImagesSync == null) return true;
    return now - this.lastImagesSync >= 86_400_000;
  }

  private async runFull(): Promise<void> {
    const fetchDetails = this.options.details ?? this.envFlag("SYNC_FETCH_DETAILS", true);
    const now = Date.now();
    const doImages = this.imagesDue(now);

    const startups = await this.syncService.syncStartups();
    if (fetchDetails || doImages) {
      for (const s of startups) {
        if (fetchDetails) {
          try { await this.syncService.syncStartupById(s.id); } catch (e) { debugLog("scheduler", "startup detail error", { id: s.id, err: (e as Error).message }); }
        }
    if (doImages) {
          try { await this.syncService.syncStartupImage(s.id); } catch (e) { debugLog("scheduler", "startup image error", { id: s.id, err: (e as Error).message }); }
        }
      }
    }

    await this.syncService.syncInvestors();
    await this.syncService.syncPartners();

    const events = await this.syncService.syncEvents();
    if (doImages) {
      for (const ev of events) {
        try { await this.syncService.syncEventImage(ev.id); } catch (e) { debugLog("scheduler", "event image error", { id: ev.id, err: (e as Error).message }); }
      }
    }

    const users = await this.syncService.syncUsers();
    if (doImages) {
      for (const u of users) {
        try { await this.syncService.syncUserImage(u.id); } catch (e) { debugLog("scheduler", "user image error", { id: u.id, err: (e as Error).message }); }
      }
    }

    const news = await this.syncService.syncNews();
    if (doImages) {
      for (const n of news) {
        try { await this.syncService.syncNewsImage(n.id); } catch (e) { debugLog("scheduler", "news image error", { id: n.id, err: (e as Error).message }); }
      }
    }

    if (doImages) {
      this.lastImagesSync = now;
      debugLog("scheduler", "Images sync cycle completed", { at: new Date(now).toISOString() });
    }
  }

  async runOnce(): Promise<void> {
    if (this.running) {
    debugLog("scheduler", "Tick skipped: a run is already in progress");
      return;
    }
    this.running = true;
    const t0 = Date.now();
    debugLog("scheduler", "Sync run started", { intervalMs: this.intervalMs });
    try {
      await this.runFull();
    debugLog("scheduler", "Sync run finished", { ms: Date.now() - t0 });
    } catch (e) {
      const err = e as Error;
    debugLog("scheduler", "Sync run error", { message: err.message });
    } finally {
      this.running = false;
      const duration = Date.now() - t0;
      if (this.pending) {
        this.pending = false;
        debugLog("scheduler", "Running deferred tick immediately after long run");
        void this.runOnce();
      } else if (duration >= this.intervalMs && this.started) {
        debugLog("scheduler", "Duration exceeded interval without explicit pending; triggering extra run", { duration, intervalMs: this.intervalMs });
        void this.runOnce();
      }
    }
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    debugLog("scheduler", "Scheduler start", { intervalMs: this.intervalMs });
    void this.runOnce();
    this.timer = setInterval(() => {
      if (this.running) {
        // On note qu'un tick a été manqué; une exécution sera déclenchée dès la fin
        this.pending = true;
        debugLog("scheduler", "Tick deferred: run in progress");
      } else {
        void this.runOnce();
      }
    }, this.intervalMs);
    this.timer.unref?.();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.started = false;
    debugLog("scheduler", "Scheduler stopped");
  }

  isRunning(): boolean { return this.running; }
  isStarted(): boolean { return this.started; }
}

  let singleton: ExternalSyncScheduler | null = null;
  export function ensureExternalSyncSchedulerInstance(
    service: ExternalSyncService,
    intervalMs?: number,
    options?: { details?: boolean; images?: boolean }
  ): ExternalSyncScheduler {
  if (!singleton) singleton = new ExternalSyncScheduler(
    service,
    intervalMs ?? parseInt(process.env.SYNC_INTERVAL_MS || "3600000", 10),
    options
  );
  return singleton;
}
