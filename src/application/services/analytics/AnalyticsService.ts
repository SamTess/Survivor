import { ContentType, EventType } from "../../../domain/enums/Analytics";
import { SessionRepository } from "../../../infrastructure/repositories/analytics/SessionRepository";
import { InteractionEventRepository } from "../../../infrastructure/repositories/analytics/InteractionEventRepository";
import { PageViewRepository } from "../../../infrastructure/repositories/analytics/PageViewRepository";
import { DailyContentMetricsRepository } from "../../../infrastructure/repositories/analytics/DailyContentMetricsRepository";
import { DailyAcquisitionMetricsRepository } from "../../../infrastructure/repositories/analytics/DailyAcquisitionMetricsRepository";
import { CreateSessionInput, Session } from "../../../domain/entities/analytics/Session";
import { RecordPageViewInput } from "../../../domain/entities/analytics/PageView";
import { RecordInteractionInput } from "../../../domain/entities/analytics/InteractionEvent";

/**
 * Regular expression used to detect content pages in order to
 * increment daily content view metrics.
 *
 * Accepted formats (case-insensitive):
 *   /startup/123
 *   /startups/123   (plural variant)
 *   /event/456
 *   /events/456     (plural variant)
 *   /news/789       ("news" is invariant)
 *
 * Group 2 captures the numeric content identifier.
 * Group 1 captures the (optionally plural) type slug.
 * We then normalize by stripping a trailing 's' except for 'news'.
 */
const CONTENT_PATH_REGEX = /^\/(startups?|news|events?)\/(\d+)/i;

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
    const match = input.path.match(CONTENT_PATH_REGEX);
    if (match) {
      let typeSlug = match[1].toLowerCase();
      if (typeSlug !== "news" && typeSlug.endsWith("s")) {
        typeSlug = typeSlug.slice(0, -1);
      }
      const contentId = Number(match[2]);
      const map: Record<string, ContentType> = {
        startup: ContentType.STARTUP,
        news: ContentType.NEWS,
        event: ContentType.EVENT,
      };
      const contentType = map[typeSlug];
      if (contentType) {
        await this.dailyContent.increment(day, contentType, contentId, { views: 1 });
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
