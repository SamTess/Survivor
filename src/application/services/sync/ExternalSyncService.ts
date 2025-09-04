import { ExternalApiClient } from "../../../infrastructure/external/ExternalApiClient";
import { StartupRepository } from "../../../infrastructure/repositories/sync/StartupRepository";
import { InvestorRepository } from "../../../infrastructure/repositories/sync/InvestorRepository";
import { PartnerRepository } from "../../../infrastructure/repositories/sync/PartnerRepository";
import { EventRepository } from "../../../infrastructure/repositories/sync/EventRepository";
import { NewsRepository } from "../../../infrastructure/repositories/sync/NewsRepository";
import { ExternalUserRepository } from "../../../infrastructure/repositories/sync/ExternalUserRepository";
import { StartupDetailApiResponse, StartupListApiResponse } from "../../../domain/interfaces/Startup";
import { InvestorApiResponse } from "../../../domain/interfaces/Investor";
import { PartnerApiResponse } from "../../../domain/interfaces/Partner";
import { EventApiResponse } from "../../../domain/interfaces/Event";
import { UserApiResponse } from "../../../domain/interfaces/User";
import { NewsApiResponse, NewsDetailApiResponse } from "../../../domain/interfaces/News";
import { debugLog } from "../../../infrastructure/logging/debugLog";
import { syncState, SyncRunSummary } from "../../../infrastructure/logging/syncState";
import prisma from "@/infrastructure/persistence/prisma/client";
import { StartupDetailApiResponse as ReconcileStartupDetail } from "../../../domain/interfaces/Startup";

export interface ExternalApiLike {
  getJson<T>(path: string, query?: Record<string, unknown>): Promise<T>;
  getBinary(path: string): Promise<Buffer>;
}

export class ExternalSyncService {
  constructor(
    private readonly api: ExternalApiClient | ExternalApiLike,
    private readonly startups: StartupRepository,
    private readonly investors: InvestorRepository,
    private readonly partners: PartnerRepository,
    private readonly events: EventRepository,
    private readonly users: ExternalUserRepository,
    private readonly newsRepo: NewsRepository
  ) {}

  private async paginate<T>(path: string, limit = 100, handler: (items: T[], ctx: { page: number; skip: number }) => Promise<void>) {
    let skip = 0;
    let page = 0;
    debugLog("paginate", `Start path=${path} limit=${limit}`);
    let lastFirstKey: string | undefined;
    while (true) {
      const t0 = Date.now();
      const items = await this.api.getJson<T[]>(path, { skip, limit });
      const dt = Date.now() - t0;
      debugLog("paginate", `Fetched page ${page} size=${items.length} ms=${dt}`, { path, skip });
      if (!items.length) break;
      const currentFirstKey = JSON.stringify(items[0]);
      if (lastFirstKey === currentFirstKey) {
        debugLog("paginate", "Detected repeating first element; aborting loop", { page, skip });
        break;
      }
      lastFirstKey = currentFirstKey;
      await handler(items, { page, skip });
      if (items.length < limit) break;
      skip += limit;
      page += 1;
      if (page > 500) {
        debugLog("paginate", "Aborting after 500 pages (safety cap)", {});
        break;
      }
    }
    debugLog("paginate", `End path=${path}`);
  }

  async syncStartups(limit = 100): Promise<StartupListApiResponse[]> {
    const collected: StartupListApiResponse[] = [];
    debugLog("startups", "Sync list start", { limit });
    let processed = 0;
  const run: SyncRunSummary = { scope: "startups", startedAt: new Date().toISOString(), pages: 0, items: 0, errors: [] };
    syncState.push(run);
    await this.paginate<StartupListApiResponse>("/startups", limit, async (items, ctx) => {
      collected.push(...items);
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        try {
          await this.startups.upsertList(it);
        } catch (e) {
          const err = e as Error;
          syncState.recordError({ scope: "startups", page: ctx.page, index: i, id: (it as unknown as { id?: unknown })?.id, message: err.message, stack: err.stack, at: new Date().toISOString() });
        }
      }
      processed += items.length;
      run.pages = ctx.page + 1;
      run.items = processed;
      debugLog("startups", "Page processed", { page: ctx.page, batch: items.length, cumulated: processed });
    });
    run.finishedAt = new Date().toISOString();
    debugLog("startups", "Sync list done", { total: processed });
    return collected;
  }

  async syncStartupById(id: number): Promise<StartupDetailApiResponse> {
    debugLog("startupDetail", "Fetch detail", { id });
    const t0 = Date.now();
    const detail = await this.api.getJson<StartupDetailApiResponse>(`/startups/${id}`);
    debugLog("startupDetail", "Detail fetched", { id, ms: Date.now() - t0, founders: detail.founders?.length || 0 });
    await this.startups.upsertDetail(detail);
    if (detail.founders?.length) {
      await this.startups.upsertFounders(detail.founders, detail.id);
      debugLog("startupDetail", "Founders upserted", { id, founders: detail.founders.length });
    }
    return detail;
  }

  async syncInvestors(limit = 100): Promise<InvestorApiResponse[]> {
    const collected: InvestorApiResponse[] = [];
    debugLog("investors", "Sync start", { limit });
    let processed = 0;
  const run: SyncRunSummary = { scope: "investors", startedAt: new Date().toISOString(), pages: 0, items: 0, errors: [] };
    syncState.push(run);
    await this.paginate<InvestorApiResponse>("/investors", limit, async (items, ctx) => {
      collected.push(...items);
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        try { await this.investors.upsert(it); } catch (e) {
          const err = e as Error;
          syncState.recordError({ scope: "investors", page: ctx.page, index: i, id: (it as unknown as { id?: unknown })?.id, message: err.message, stack: err.stack, at: new Date().toISOString() });
        }
      }
      processed += items.length;
      run.pages = ctx.page + 1;
      run.items = processed;
      debugLog("investors", "Page processed", { page: ctx.page, batch: items.length, cumulated: processed });
    });
    run.finishedAt = new Date().toISOString();
    debugLog("investors", "Sync done", { total: processed });
    return collected;
  }

  async syncInvestorById(id: number): Promise<InvestorApiResponse> {
  debugLog("investorDetail", "Fetch", { id });
  const item = await this.api.getJson<InvestorApiResponse>(`/investors/${id}`);
    await this.investors.upsert(item);
  debugLog("investorDetail", "Upserted", { id });
    return item;
  }

  async syncPartners(limit = 100): Promise<PartnerApiResponse[]> {
    const collected: PartnerApiResponse[] = [];
    debugLog("partners", "Sync start", { limit });
    let processed = 0;
  const run: SyncRunSummary = { scope: "partners", startedAt: new Date().toISOString(), pages: 0, items: 0, errors: [] };
    syncState.push(run);
    await this.paginate<PartnerApiResponse>("/partners", limit, async (items, ctx) => {
      collected.push(...items);
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        try { await this.partners.upsert(it); } catch (e) {
          const err = e as Error;
          syncState.recordError({ scope: "partners", page: ctx.page, index: i, id: (it as unknown as { id?: unknown })?.id, message: err.message, stack: err.stack, at: new Date().toISOString() });
        }
      }
      processed += items.length;
      run.pages = ctx.page + 1;
      run.items = processed;
      debugLog("partners", "Page processed", { page: ctx.page, batch: items.length, cumulated: processed });
    });
    run.finishedAt = new Date().toISOString();
    debugLog("partners", "Sync done", { total: processed });
    return collected;
  }

  async syncPartnerById(id: number): Promise<PartnerApiResponse> {
  debugLog("partnerDetail", "Fetch", { id });
  const item = await this.api.getJson<PartnerApiResponse>(`/partners/${id}`);
    await this.partners.upsert(item);
  debugLog("partnerDetail", "Upserted", { id });
    return item;
  }

  async syncEvents(limit = 100): Promise<EventApiResponse[]> {
    const collected: EventApiResponse[] = [];
    debugLog("events", "Sync start", { limit });
    let processed = 0;
  const run: SyncRunSummary = { scope: "events", startedAt: new Date().toISOString(), pages: 0, items: 0, errors: [] };
    syncState.push(run);
    await this.paginate<EventApiResponse>("/events", limit, async (items, ctx) => {
      collected.push(...items);
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        try { await this.events.upsert(it); } catch (e) {
          const err = e as Error;
          syncState.recordError({ scope: "events", page: ctx.page, index: i, id: (it as unknown as { id?: unknown })?.id, message: err.message, stack: err.stack, at: new Date().toISOString() });
        }
      }
      processed += items.length;
      run.pages = ctx.page + 1;
      run.items = processed;
      debugLog("events", "Page processed", { page: ctx.page, batch: items.length, cumulated: processed });
    });
    run.finishedAt = new Date().toISOString();
    debugLog("events", "Sync done", { total: processed });
    return collected;
  }

  async syncEventById(id: number): Promise<EventApiResponse> {
  debugLog("eventDetail", "Fetch", { id });
  const item = await this.api.getJson<EventApiResponse>(`/events/${id}`);
    await this.events.upsert(item);
  debugLog("eventDetail", "Upserted", { id });
    return item;
  }

  async syncEventImage(id: number): Promise<void> {
  debugLog("eventImage", "Fetch", { id });
  const data = await this.api.getBinary(`/events/${id}/image`);
    await this.events.saveImage(id, data);
  debugLog("eventImage", "Saved", { id, bytes: data.byteLength });
  }

  async syncStartupImage(id: number): Promise<void> {
  debugLog("startupImage", "Fetch", { id });
  const data = await this.api.getBinary(`/startups/${id}/image`);
    await this.startups.saveImage(id, data);
  debugLog("startupImage", "Saved", { id, bytes: data.byteLength });
  }

  async syncUsers(limit = 100): Promise<UserApiResponse[]> {
    const collected: UserApiResponse[] = [];
    debugLog("users", "Sync start", { limit });
    let processed = 0;
  const run: SyncRunSummary = { scope: "users", startedAt: new Date().toISOString(), pages: 0, items: 0, errors: [] };
    syncState.push(run);
    await this.paginate<UserApiResponse>("/users", limit, async (items, ctx) => {
      collected.push(...items);
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        try { await this.users.upsert(it); } catch (e) {
          const err = e as Error;
          syncState.recordError({ scope: "users", page: ctx.page, index: i, id: (it as unknown as { id?: unknown })?.id, message: err.message, stack: err.stack, at: new Date().toISOString() });
        }
      }
      processed += items.length;
      run.pages = ctx.page + 1;
      run.items = processed;
      debugLog("users", "Page processed", { page: ctx.page, batch: items.length, cumulated: processed });
    });
    run.finishedAt = new Date().toISOString();
    debugLog("users", "Sync done", { total: processed });
    return collected;
  }

  async syncUserById(id: number): Promise<UserApiResponse> {
  debugLog("userDetail", "Fetch", { id });
  const item = await this.api.getJson<UserApiResponse>(`/users/${id}`);
    await this.users.upsert(item);
  debugLog("userDetail", "Upserted", { id });
    return item;
  }

  async syncUserByEmail(email: string): Promise<UserApiResponse> {
  debugLog("userByEmail", "Fetch", { email });
  const item = await this.api.getJson<UserApiResponse>(`/users/email/${encodeURIComponent(email)}`);
    await this.users.upsert(item);
  debugLog("userByEmail", "Upserted", { id: item.id });
    return item;
  }

  async syncUserImage(id: number): Promise<void> {
  debugLog("userImage", "Fetch", { id });
  const data = await this.api.getBinary(`/users/${id}/image`);
    await this.users.saveImage(id, data);
  debugLog("userImage", "Saved", { id, bytes: data.byteLength });
  }

  async syncStartupFounderImage(startupId: number, founderId: number): Promise<Buffer> {
  debugLog("founderImage", "Fetch", { startupId, founderId });
  const data = await this.api.getBinary(`/startups/${startupId}/founders/${founderId}/image`);
    await this.users.saveImage(founderId, data);
  debugLog("founderImage", "Saved", { founderId, bytes: data.byteLength });
    return data;
  }

  async syncAll(): Promise<void> {
    debugLog("all", "Global sync start", {});
    const t0 = Date.now();
    await this.syncStartups();
    await this.syncInvestors();
    await this.syncPartners();
    await this.syncEvents();
    await this.syncUsers();
    if (this.newsRepo) await this.syncNews();
  await this.reconcileFoundersMissingUser();
    debugLog("all", "Global sync done", { ms: Date.now() - t0 });
  }

  async syncNews(limit = 100): Promise<NewsApiResponse[]> {
    if (!this.newsRepo) return [];
    debugLog("news", "Sync start", { limit });
    const collected: NewsApiResponse[] = [];
    let processed = 0;
    const run: SyncRunSummary = { scope: "news", startedAt: new Date().toISOString(), pages: 0, items: 0, errors: [] };
    syncState.push(run);
    await this.paginate<NewsApiResponse>("/news", limit, async (items, ctx) => {
      collected.push(...items);
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        try { await this.newsRepo!.upsert(it); } catch (e) {
          const err = e as Error; syncState.recordError({ scope: "news", page: ctx.page, index: i, id: (it as unknown as { id?: unknown })?.id, message: err.message, stack: err.stack, at: new Date().toISOString() });
        }
      }
      processed += items.length;
      run.pages = ctx.page + 1; run.items = processed;
      debugLog("news", "Page processed", { page: ctx.page, batch: items.length, cumulated: processed });
    });
    run.finishedAt = new Date().toISOString();
    debugLog("news", "Sync done", { total: processed });
    return collected;
  }

  async syncNewsById(id: number): Promise<NewsDetailApiResponse | null> {
    if (!this.newsRepo) return null;
    debugLog("newsDetail", "Fetch", { id });
    const item = await this.api.getJson<NewsDetailApiResponse>(`/news/${id}`);
    await this.newsRepo.upsert(item);
    debugLog("newsDetail", "Upserted", { id });
    return item;
  }

  async syncNewsImage(id: number): Promise<void> {
    if (!this.newsRepo) return;
    debugLog("newsImage", "Fetch", { id });
    const data = await this.api.getBinary(`/news/${id}/image`);
    await this.newsRepo.saveImage(id, data);
    debugLog("newsImage", "Saved", { id, bytes: data.byteLength });
  }

  async reconcileFoundersMissingUser(): Promise<void> {
  if (process.env.VITEST || process.env.NODE_ENV === 'test') {
      debugLog("founderReconcile", "Skipped in test environment", {});
      return;
    }
    let missing: Awaited<ReturnType<typeof prisma.s_FOUNDER.findMany>> = [];
    try {
      missing = await prisma.s_FOUNDER.findMany({ where: { user_id: undefined } });
    } catch (e) {
      debugLog("founderReconcile", "Skipped (DB unavailable)", { error: (e as Error).message });
      return;
    }
    if (!missing.length) {
      debugLog("founderReconcile", "No founders to reconcile", {});
      return;
    }
    debugLog("founderReconcile", "Start", { count: missing.length });

    const byStartup = new Map<number, typeof missing>();
    for (const f of missing) {
      if (!byStartup.has(f.startup_id)) byStartup.set(f.startup_id, []);
      byStartup.get(f.startup_id)!.push(f);
    }

    let linked = 0;
    for (const [startupId, founders] of byStartup.entries()) {
      let externalFounders: { id: number; name: string; startup_id: number }[] = [];
      try {
        const detail = await this.api.getJson<ReconcileStartupDetail>(`/startups/${startupId}`);
        externalFounders = detail.founders || [];
      } catch (e) {
        debugLog("founderReconcile", "Could not fetch startup detail", { startupId, error: (e as Error).message });
        continue;
      }
      if (!externalFounders.length) continue;
      const idToName = new Map<number, string>();
      for (const ef of externalFounders) idToName.set(ef.id, ef.name);

      const byName = new Map<string, typeof founders>();
      for (const f of founders) {
        const name = idToName.get(f.id);
        if (!name) continue;
        if (!byName.has(name)) byName.set(name, []);
        byName.get(name)!.push(f);
      }

      for (const [name, founderRows] of byName.entries()) {
        const candidates = await prisma.s_USER.findMany({
          where: { name },
          orderBy: { id: 'asc' },
        });
        if (!candidates.length) {
          debugLog("founderReconcile", "No user candidates for name", { startupId, name });
          continue;
        }
        if (candidates.length === 1) {
          const userId = candidates[0].id;
          for (const fr of founderRows) {
            try {
              await prisma.s_FOUNDER.update({ where: { id: fr.id }, data: { user_id: userId } });
              linked++;
              debugLog("founderReconcile", "Linked single candidate", { founderId: fr.id, userId, startupId, name });
            } catch (e) {
              debugLog("founderReconcile", "Link failed", { founderId: fr.id, userId, error: (e as Error).message });
            }
          }
          continue;
        }
        if (candidates.length === founderRows.length) {
          for (let i = 0; i < founderRows.length; i++) {
            const fr = founderRows[i];
            const userId = candidates[i].id;
            try {
              await prisma.s_FOUNDER.update({ where: { id: fr.id }, data: { user_id: userId } });
              linked++;
              debugLog("founderReconcile", "Linked matched cardinality", { founderId: fr.id, userId, startupId, name });
            } catch (e) {
              debugLog("founderReconcile", "Link failed", { founderId: fr.id, userId, error: (e as Error).message });
            }
          }
        } else {
          debugLog("founderReconcile", "Ambiguous mapping skipped", { startupId, name, founderMissing: founderRows.length, userCandidates: candidates.length });
        }
      }
    }
    debugLog("founderReconcile", "Done", { linked, remaining: missing.length - linked });
  }
}
