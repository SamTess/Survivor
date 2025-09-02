import prisma from "./../client";
import { DailyContentMetricsRepository } from "../../../repositories/analytics/DailyContentMetricsRepository";
import { ContentType as DomainContentType } from "../../../../domain/enums/Analytics";
import { IncrementContentMetrics } from "../../../../domain/entities/analytics/DailyContentMetrics";

const zeroIfUndefined = (n?: number) => n ?? 0;

export class DailyContentMetricsRepositoryPrisma implements DailyContentMetricsRepository {
  async increment(day: Date, contentType: DomainContentType, contentId: number, inc: IncrementContentMetrics): Promise<void> {
  const prismaContentType = contentType as unknown as typeof contentType;
    await prisma.s_DAILY_CONTENT_METRICS.upsert({
      where: { day_contentType_contentId: { day, contentType: prismaContentType, contentId } },
      update: {
        views: { increment: zeroIfUndefined(inc.views) },
        uniqueUsers: { increment: zeroIfUndefined(inc.uniqueUsers) },
        clicks: { increment: zeroIfUndefined(inc.clicks) },
        likes: { increment: zeroIfUndefined(inc.likes) },
        bookmarks: { increment: zeroIfUndefined(inc.bookmarks) },
        shares: { increment: zeroIfUndefined(inc.shares) },
        followers: { increment: zeroIfUndefined(inc.followers) },
      },
      create: {
        day,
        contentType: prismaContentType,
        contentId,
        views: zeroIfUndefined(inc.views),
        uniqueUsers: zeroIfUndefined(inc.uniqueUsers),
        clicks: zeroIfUndefined(inc.clicks),
        likes: zeroIfUndefined(inc.likes),
        bookmarks: zeroIfUndefined(inc.bookmarks),
        shares: zeroIfUndefined(inc.shares),
        followers: zeroIfUndefined(inc.followers),
      },
    });
  }
}
