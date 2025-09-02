import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExternalSyncService } from '../../application/services/sync/ExternalSyncService';
import { StartupRepository } from '../../infrastructure/repositories/StartupRepository';
import { InvestorRepository } from '../../infrastructure/repositories/InvestorRepository';
import { PartnerRepository } from '../../infrastructure/repositories/PartnerRepository';
import { EventRepository } from '../../infrastructure/repositories/EventRepository';
import { ExternalUserRepository } from '../../infrastructure/repositories/ExternalUserRepository';
import { NewsRepository } from '../../infrastructure/repositories/NewsRepository';
import { syncState } from '../../infrastructure/logging/syncState';
import { StartupListApiResponse, StartupDetailApiResponse, StartupFounder } from '../../domain/interfaces/Startup';
import { InvestorApiResponse } from '../../domain/interfaces/Investor';
import { PartnerApiResponse } from '../../domain/interfaces/Partner';
import { EventApiResponse } from '../../domain/interfaces/Event';
import { UserApiResponse } from '../../domain/interfaces/User';
import { NewsApiResponse } from '../../domain/interfaces/News';

// Fake ExternalApiClient behaviour
class FakeApiClient {
  constructor(private pages: Record<string, unknown[][] | unknown>, private binaries: Record<string, Buffer> = {}) {}
  getJson<T>(path: string, query?: Record<string, unknown>): Promise<T> {
    const key = path;
    const entry = this.pages[key];
    // Non paginé (détail)
    if (entry && (!Array.isArray(entry) || (Array.isArray(entry) && entry.length && !Array.isArray(entry[0])))) {
      return Promise.resolve(entry as T);
    }
    const skip = (query?.skip as number) || 0;
    const limit = (query?.limit as number) || 100;
    const all = (entry as unknown[][]) || [];
    const pageIndex = Math.floor(skip / limit);
    const page = all[pageIndex] || [];
    return Promise.resolve(page as unknown as T);
  }
  getBinary(path: string): Promise<Buffer> {
    return Promise.resolve(this.binaries[path] || Buffer.from('img'));
  }
}


class MemoryStartupRepo implements StartupRepository {
  list: StartupListApiResponse[] = []; detail: StartupDetailApiResponse[] = []; founders: { startupId: number; founders: StartupFounder[] }[] = [];
  async upsertList(item: StartupListApiResponse): Promise<void> { this.list.push(item); }
  async upsertDetail(item: StartupDetailApiResponse): Promise<void> { this.detail.push(item); }
  async upsertFounders(f: StartupFounder[], startupId: number): Promise<void> { this.founders.push({ startupId, founders: f }); }
}

type AnyRepoEntity = InvestorApiResponse | PartnerApiResponse | EventApiResponse | UserApiResponse | NewsApiResponse;
class MemorySimpleRepo implements InvestorRepository, PartnerRepository, EventRepository, ExternalUserRepository, NewsRepository {
  items: AnyRepoEntity[] = []; images: Record<number, Buffer> = {};
  async upsert(item: AnyRepoEntity): Promise<void> { this.items.push(item); }
  async saveImage(id: number, data: Buffer): Promise<void> { this.images[id] = data; }
}

describe('ExternalSyncService', () => {
  let service: ExternalSyncService;
  let api: FakeApiClient;
  let startupRepo: MemoryStartupRepo;
  let investorRepo: MemorySimpleRepo;
  let partnerRepo: MemorySimpleRepo;
  let eventRepo: MemorySimpleRepo;
  let userRepo: MemorySimpleRepo;
  let newsRepo: MemorySimpleRepo;

  beforeEach(() => {
    syncState.runs.length = 0; // reset
    syncState.lastError = undefined;
    startupRepo = new MemoryStartupRepo();
    investorRepo = new MemorySimpleRepo();
    partnerRepo = new MemorySimpleRepo();
    eventRepo = new MemorySimpleRepo();
    userRepo = new MemorySimpleRepo();
    newsRepo = new MemorySimpleRepo();
  });

  it('syncStartups consomme une seule page et enregistre', async () => {
    api = new FakeApiClient({ '/startups': [[{ id: 1, name: 'A', email: 'a@a' }]] });
    service = new ExternalSyncService(api, startupRepo, investorRepo, partnerRepo, eventRepo, userRepo, newsRepo);
    await service.syncStartups(50);
    expect(startupRepo.list.length).toBe(1);
    expect(syncState.runs.some(r => r.scope === 'startups')).toBe(true);
  });

  it('paginate garde-fou stoppe quand première entrée se répète (users)', async () => {
    const repeated = { id: 10, email: 'u@test', name: 'U', role: 'USER' };
    api = new FakeApiClient({ '/users': [Array(2).fill(repeated), Array(2).fill(repeated)] });
    service = new ExternalSyncService(api, startupRepo, investorRepo, partnerRepo, eventRepo, userRepo, newsRepo);
    const res = await service.syncUsers(2);
    expect(res.length).toBe(2); // seconde page ignorée
    expect(syncState.runs.find(r => r.scope === 'users')?.pages).toBe(1);
  });

  it('errors item n’arrêtent pas la page', async () => {
    // Make investor upsert throw for one item
  investorRepo.upsert = vi.fn().mockImplementation((item: InvestorApiResponse) => {
      if (item.id === 2) throw new Error('boom');
      return Promise.resolve();
    });
    api = new FakeApiClient({ '/investors': [[{ id: 1, email: 'i1', name: 'I1' }, { id: 2, email: 'i2', name: 'I2' }]] });
    service = new ExternalSyncService(api, startupRepo, investorRepo, partnerRepo, eventRepo, userRepo, newsRepo);
    await service.syncInvestors(50);
    const run = syncState.runs.find(r => r.scope === 'investors');
    expect(run?.errors.length).toBe(1);
    expect(run?.items).toBe(2);
  });

  it('syncNews fonctionne si repo présent', async () => {
    api = new FakeApiClient({ '/news': [[{ id: 5, title: 'N', created_at: '', updated_at: '', startup_id: 1 }]] });
    service = new ExternalSyncService(api, startupRepo, investorRepo, partnerRepo, eventRepo, userRepo, newsRepo);
    await service.syncNews();
    expect(newsRepo.items.length).toBe(1);
  });

  it('syncAll enchaîne plusieurs ressources', async () => {
    api = new FakeApiClient({
      '/startups': [[{ id: 1, name: 'S', email: 's@s' }]],
      '/investors': [[{ id: 2, email: 'i', name: 'I' }]],
      '/partners': [[{ id: 3, email: 'p', name: 'P' }]],
      '/events': [[{ id: 4, name: 'E' }]],
      '/users': [[{ id: 10, email: 'u', name: 'U', role: 'USER' }]],
      '/news': [[{ id: 6, title: 'N', created_at: '', updated_at: '', startup_id: 1 }]],
    });
    service = new ExternalSyncService(api, startupRepo, investorRepo, partnerRepo, eventRepo, userRepo, newsRepo);
    await service.syncAll();
    expect(syncState.runs.map(r => r.scope)).toContain('users');
    expect(newsRepo.items.length).toBe(1);
  });

  it('syncStartupById enregistre détail et fondateurs', async () => {
  const detail: StartupDetailApiResponse = { id: 42, name: 'DeepStart', email: 'deep@start', founders: [{ id: 1001, name: 'Alice', startup_id: 42 }], created_at: '', updated_at: '' };
    api = new FakeApiClient({ '/startups/42': detail });
    service = new ExternalSyncService(api, startupRepo, investorRepo, partnerRepo, eventRepo, userRepo, newsRepo);
    const res = await service.syncStartupById(42);
    expect(res.id).toBe(42);
    expect(startupRepo.detail.length).toBe(1);
    expect(startupRepo.founders[0].founders[0].id).toBe(1001);
  });

  it('syncUserByEmail upsert', async () => {
    const encodedPath = '/users/email/u%40mail.com';
    api = new FakeApiClient({ [encodedPath]: { id: 77, email: 'u@mail.com', name: 'MailUser', role: 'USER' } });
    service = new ExternalSyncService(api, startupRepo, investorRepo, partnerRepo, eventRepo, userRepo, newsRepo);
    const user = await service.syncUserByEmail('u@mail.com');
    expect(user.id).toBe(77);
    expect(userRepo.items.some(i => (i as UserApiResponse).id === 77)).toBe(true);
  });

  it('syncUserImage sauvegarde image', async () => {
    const buf = Buffer.from('userimg');
    api = new FakeApiClient({ '/users': [[{ id: 10, email: 'u', name: 'U', role: 'USER' }]] }, { '/users/10/image': buf });
    service = new ExternalSyncService(api, startupRepo, investorRepo, partnerRepo, eventRepo, userRepo, newsRepo);
    await service.syncUserImage(10);
    expect(userRepo.images[10]).toBe(buf);
  });

  it('syncEventImage sauvegarde image', async () => {
    const buf = Buffer.from('eventimg');
    api = new FakeApiClient({ '/events': [[{ id: 4, name: 'E' }]] }, { '/events/4/image': buf });
    service = new ExternalSyncService(api, startupRepo, investorRepo, partnerRepo, eventRepo, userRepo, newsRepo);
    await service.syncEventImage(4);
    expect(eventRepo.images[4]).toBe(buf);
  });

  it('syncNewsImage sauvegarde image', async () => {
    const buf = Buffer.from('newsimg');
    api = new FakeApiClient({ '/news': [[{ id: 9, title: 'N', created_at: '', updated_at: '', startup_id: 1 }]] }, { '/news/9/image': buf });
    service = new ExternalSyncService(api, startupRepo, investorRepo, partnerRepo, eventRepo, userRepo, newsRepo);
    await service.syncNewsImage(9);
    expect(newsRepo.images[9]).toBe(buf);
  });

  it('syncStartupFounderImage sauvegarde image du founder', async () => {
    const buf = Buffer.from('founderimg');
    api = new FakeApiClient({ '/startups': [[{ id: 1, name: 'S', email: 's@s' }]] }, { '/startups/1/founders/500/image': buf });
    service = new ExternalSyncService(api, startupRepo, investorRepo, partnerRepo, eventRepo, userRepo, newsRepo);
    const returned = await service.syncStartupFounderImage(1, 500);
    expect(returned).toBe(buf);
    expect(userRepo.images[500]).toBe(buf);
  });
});
