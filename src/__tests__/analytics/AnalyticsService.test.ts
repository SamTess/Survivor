import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService } from '../../application/services/analytics/AnalyticsService';
import { ContentType, EventType } from '../../domain/enums/Analytics';
import { CreateSessionInput, Session } from '../../domain/entities/analytics/Session';
import { RecordPageViewInput, PageView } from '../../domain/entities/analytics/PageView';
import { RecordInteractionInput, InteractionEvent } from '../../domain/entities/analytics/InteractionEvent';
import { SessionRepository } from '../../infrastructure/repositories/analytics/SessionRepository';
import { InteractionEventRepository } from '../../infrastructure/repositories/analytics/InteractionEventRepository';
import { PageViewRepository } from '../../infrastructure/repositories/analytics/PageViewRepository';
import { DailyContentMetricsRepository } from '../../infrastructure/repositories/analytics/DailyContentMetricsRepository';
import { DailyAcquisitionMetricsRepository } from '../../infrastructure/repositories/analytics/DailyAcquisitionMetricsRepository';

// Fakes
interface StoredSession { id: string; occurredAt: Date; ipHash: string; contentType: ContentType; userId?: number | null; contentId?: number | null; [k: string]: unknown }
class FakeSessionRepo implements SessionRepository {
  sessions: StoredSession[] = [];
  async create(data: CreateSessionInput): Promise<Session> {
    const session: StoredSession = { id: 'sess-1', occurredAt: new Date(), ipHash: 'hash', ...data } as StoredSession;
    this.sessions.push(session);
    return session;
  }
  async findById(id: string): Promise<Session | null> { return this.sessions.find(s => s.id === id) || null; }
}

interface StoredEvent { id: string; occurredAt: Date; ipHash: string; eventType: EventType; contentType: ContentType; contentId?: number | null; userId?: number | null; [k: string]: unknown }
class FakeInteractionRepo implements InteractionEventRepository {
  events: StoredEvent[] = [];
  async record(data: RecordInteractionInput): Promise<InteractionEvent> {
    const ev: StoredEvent = { id: 'evt-' + (this.events.length + 1), occurredAt: new Date(), ipHash: 'h', ...data } as StoredEvent;
    this.events.push(ev);
    return ev;
  }
}

interface StoredPageView { id: string; occurredAt: Date; path: string; sessionId?: string | null; userId?: number | null; [k: string]: unknown }
class FakePageViewRepo implements PageViewRepository {
  views: StoredPageView[] = [];
  async record(data: RecordPageViewInput): Promise<PageView> { const pv: StoredPageView = { id: 'pv-' + (this.views.length + 1), occurredAt: new Date(), ...data } as StoredPageView; this.views.push(pv); return pv; }
}

type ContentInc = { day: string; contentType: ContentType; contentId: number; inc: Record<string, number> };
class FakeDailyContentRepo implements DailyContentMetricsRepository {
  increments: ContentInc[] = [];
  async increment(day: Date, contentType: ContentType, contentId: number, inc: Record<string, number>): Promise<void> {
    this.increments.push({ day: day.toISOString(), contentType, contentId, inc });
  }
}

type AcqInc = { day: string; dims: { utmSource?: string | null; utmMedium?: string | null; utmCampaign?: string | null }; inc: Record<string, number> };
class FakeDailyAcquisitionRepo implements DailyAcquisitionMetricsRepository {
  increments: AcqInc[] = [];
  async increment(day: Date, dims: AcqInc['dims'], inc: Record<string, number>): Promise<void> { this.increments.push({ day: day.toISOString(), dims, inc }); }
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let sessionRepo: FakeSessionRepo;
  let dailyAcq: FakeDailyAcquisitionRepo;
  let dailyContent: FakeDailyContentRepo;
  let interactionRepo: FakeInteractionRepo;
  let pageViewRepo: FakePageViewRepo;

  beforeEach(() => {
    sessionRepo = new FakeSessionRepo();
    interactionRepo = new FakeInteractionRepo();
    pageViewRepo = new FakePageViewRepo();
    dailyContent = new FakeDailyContentRepo();
    dailyAcq = new FakeDailyAcquisitionRepo();
  service = new AnalyticsService(sessionRepo, interactionRepo, pageViewRepo, dailyContent, dailyAcq);
  });

  it('startSession incrémente acquisition (sessions et users si userId)', async () => {
    await service.startSession({ contentType: ContentType.PAGE, userId: 42 });
    expect(dailyAcq.increments.length).toBe(1);
    expect(dailyAcq.increments[0].inc).toEqual({ sessions: 1, users: 1 });
  });

  it('startSession sans userId n’incrémente pas users', async () => {
    await service.startSession({ contentType: ContentType.PAGE });
    expect(dailyAcq.increments.at(-1)?.inc).toEqual({ sessions: 1, users: 0 });
  });

  it('recordPageView incrémente vues quand chemin correspond', async () => {
    await service.recordPageView({ path: '/startups/123', sessionId: 'sess', userId: 1 });
    expect(dailyContent.increments.length).toBe(1);
    expect(dailyContent.increments[0].contentId).toBe(123);
    expect(dailyContent.increments[0].inc).toEqual({ views: 1 });
  });

  it('recordPageView n’incrémente pas si chemin ne matche pas', async () => {
    await service.recordPageView({ path: '/autre/123', sessionId: 'sess', userId: 1 });
    expect(dailyContent.increments.length).toBe(0);
  });

  it('recordInteraction LIKE incrémente likes', async () => {
    await service.recordInteraction({ eventType: EventType.LIKE, contentType: ContentType.STARTUP, contentId: 10 });
    expect(dailyContent.increments[0].inc.likes).toBe(1);
  });

  it('recordInteraction CLICK incrémente clicks', async () => {
    await service.recordInteraction({ eventType: EventType.CLICK, contentType: ContentType.STARTUP, contentId: 11 });
    expect(dailyContent.increments.at(-1)?.inc.clicks).toBe(1);
  });

  it('recordInteraction BOOKMARK incrémente bookmarks', async () => {
    await service.recordInteraction({ eventType: EventType.BOOKMARK, contentType: ContentType.NEWS, contentId: 5 });
    expect(dailyContent.increments.at(-1)?.inc.bookmarks).toBe(1);
  });

  it('recordInteraction SHARE incrémente shares', async () => {
    await service.recordInteraction({ eventType: EventType.SHARE, contentType: ContentType.EVENT, contentId: 7 });
    expect(dailyContent.increments.at(-1)?.inc.shares).toBe(1);
  });

  it('recordInteraction FOLLOW incrémente followers', async () => {
    await service.recordInteraction({ eventType: EventType.FOLLOW, contentType: ContentType.STARTUP, contentId: 1 });
    expect(dailyContent.increments.at(-1)?.inc.followers).toBe(1);
  });

  it('recordInteraction SIGNUP sans userId incrémente signups mais pas users', async () => {
    const before = dailyAcq.increments.length;
    await service.recordInteraction({ eventType: EventType.SIGNUP, contentType: ContentType.PAGE });
    const last = dailyAcq.increments.at(-1);
    expect(dailyAcq.increments.length).toBeGreaterThan(before);
    expect(last?.inc.signups).toBe(1);
    expect(last?.inc.users).toBe(0);
  });

  it('recordInteraction avec eventType LOGIN ne modifie pas content metrics', async () => {
    const before = dailyContent.increments.length;
    await service.recordInteraction({ eventType: EventType.LOGIN, contentType: ContentType.PAGE });
    expect(dailyContent.increments.length).toBe(before); // aucun ajout
  });

  it('recordInteraction sans contentId ne met pas à jour content metrics pour LIKE', async () => {
    const before = dailyContent.increments.length;
    await service.recordInteraction({ eventType: EventType.LIKE, contentType: ContentType.STARTUP });
    expect(dailyContent.increments.length).toBe(before); // pas de contentId
  });

  it('recordPageView accumule les vues sur plusieurs appels', async () => {
    await service.recordPageView({ path: '/startups/50' });
    await service.recordPageView({ path: '/startups/50' });
    const incrementsFor50 = dailyContent.increments.filter(i => i.contentId === 50);
    expect(incrementsFor50.length).toBe(2);
    expect(incrementsFor50.every(i => i.inc.views === 1)).toBe(true);
  });

  it('recordInteraction SIGNUP incrémente acquisition signups et users si userId', async () => {
    await service.recordInteraction({ eventType: EventType.SIGNUP, contentType: ContentType.PAGE, userId: 7 });
  expect(dailyAcq.increments.some((c) => c.inc.signups === 1 && c.inc.users === 1)).toBe(true);
  });
});
