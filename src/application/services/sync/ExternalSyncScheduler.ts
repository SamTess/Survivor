import { ExternalSyncService } from "./ExternalSyncService";
import { debugLog } from "../../../infrastructure/logging/debugLog";

export class ExternalSyncScheduler {
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private started = false;

  constructor(private readonly syncService: Pick<ExternalSyncService, "syncAll">, private readonly intervalMs: number = 3600_000) {}

  async runOnce(): Promise<void> {
    if (this.running) {
      debugLog("scheduler", "Tick ignoré: exécution déjà en cours");
      return;
    }
    this.running = true;
    const t0 = Date.now();
    debugLog("scheduler", "Synchronisation démarrée", { intervalMs: this.intervalMs });
    try {
      await this.syncService.syncAll();
      debugLog("scheduler", "Synchronisation terminée", { ms: Date.now() - t0 });
    } catch (e) {
      const err = e as Error;
      debugLog("scheduler", "Erreur de synchronisation", { message: err.message });
    } finally {
      this.running = false;
    }
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    debugLog("scheduler", "Démarrage du scheduler", { intervalMs: this.intervalMs });
    void this.runOnce();
    this.timer = setInterval(() => void this.runOnce(), this.intervalMs);
    this.timer.unref?.();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.started = false;
    debugLog("scheduler", "Scheduler arrêté");
  }

  isRunning(): boolean { return this.running; }
  isStarted(): boolean { return this.started; }
}

let singleton: ExternalSyncScheduler | null = null;
export function ensureExternalSyncSchedulerInstance(service: ExternalSyncService, intervalMs?: number): ExternalSyncScheduler {
  if (!singleton) singleton = new ExternalSyncScheduler(service, intervalMs ?? parseInt(process.env.SYNC_INTERVAL_MS || "3600000", 10));
  return singleton;
}
