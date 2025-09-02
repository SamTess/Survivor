import { ContentType, EventType } from "../../../domain/enums/Analytics";
import { SessionRepository } from "../../../infrastructure/repositories/analytics/SessionRepository";
import { InteractionEventRepository } from "../../../infrastructure/repositories/analytics/InteractionEventRepository";
import { PageViewRepository } from "../../../infrastructure/repositories/analytics/PageViewRepository";
import { DailyContentMetricsRepository } from "../../../infrastructure/repositories/analytics/DailyContentMetricsRepository";
import { DailyAcquisitionMetricsRepository } from "../../../infrastructure/repositories/analytics/DailyAcquisitionMetricsRepository";
import { CreateSessionInput, Session } from "../../../domain/entities/analytics/Session";
import { RecordPageViewInput } from "../../../domain/entities/analytics/PageView";
import { RecordInteractionInput } from "../../../domain/entities/analytics/InteractionEvent";

const truncateToDayUTC = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

export class AnalyticsService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly interactions: InteractionEventRepository,
    private readonly pageViews: PageViewRepository,
    private readonly dailyContent: DailyContentMetricsRepository,
    private readonly dailyAcquisition: DailyAcquisitionMetricsRepository
  ) {}

  async startSession(input: CreateSessionInput): Promise<Session> {
    const session = await this.sessions.create(input);
    const day = truncateToDayUTC(new Date());
    await this.dailyAcquisition.increment(day, {
      utmSource: session.utmSource,
      utmMedium: session.utmMedium,
      utmCampaign: session.utmCampaign,
    }, { sessions: 1, users: session.userId ? 1 : 0 });
    return session;
  }

  async recordPageView(input: RecordPageViewInput): Promise<void> {
    await this.pageViews.record(input);
    const day = truncateToDayUTC(new Date());
  const match = input.path.match(/^\/(startup|news|event)s?\/(\d+)/i);
    if (match) {
      const kind = match[1].toUpperCase();
      let contentType: ContentType | undefined;
  if (kind === "STARTUP") contentType = ContentType.STARTUP;
  else if (kind === "NEWS") contentType = ContentType.NEWS;
  else if (kind === "EVENT") contentType = ContentType.EVENT;
      if (contentType) {
        await this.dailyContent.increment(day, contentType, Number(match[2]), { views: 1 });
      }
    }
  }

  async recordInteraction(input: RecordInteractionInput): Promise<void> {
    const event = await this.interactions.record(input);
    const day = truncateToDayUTC(new Date());
  const inc: Partial<Record<"clicks" | "likes" | "bookmarks" | "shares" | "followers", number>> = {};
    if (event.eventType === EventType.CLICK) inc.clicks = 1;
    if (event.eventType === EventType.LIKE) inc.likes = 1;
    if (event.eventType === EventType.BOOKMARK) inc.bookmarks = 1;
    if (event.eventType === EventType.SHARE) inc.shares = 1;
    if (event.eventType === EventType.FOLLOW) inc.followers = 1;
    if (Object.keys(inc).length && event.contentType && event.contentId) {
      await this.dailyContent.increment(day, event.contentType, event.contentId, inc);
    }
    if (event.eventType === EventType.SIGNUP) {
      await this.dailyAcquisition.increment(day, {
        utmSource: event.utmSource,
        utmMedium: event.utmMedium,
        utmCampaign: event.utmCampaign,
      }, { signups: 1, users: event.userId ? 1 : 0 });
    }
  }
}
