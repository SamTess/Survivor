import prisma from "./client";
import { DailyAcquisitionMetricsRepository } from "../../repositories/analytics/DailyAcquisitionMetricsRepository";
import { IncrementAcquisitionMetrics } from "../../../domain/entities/analytics/DailyAcquisitionMetrics";

const zeroIfUndefined = (n?: number) => n ?? 0;

export class DailyAcquisitionMetricsRepositoryPrisma implements DailyAcquisitionMetricsRepository {
  async increment(
    day: Date,
    dims: { utmSource?: string | null; utmMedium?: string | null; utmCampaign?: string | null },
    inc: IncrementAcquisitionMetrics
  ): Promise<void> {
    const key = {
      day,
      utmSource: dims.utmSource ?? "",
      utmMedium: dims.utmMedium ?? "",
      utmCampaign: dims.utmCampaign ?? "",
    };
    await prisma.s_DAILY_ACQUISITION_METRICS.upsert({
      where: {
        day_utmSource_utmMedium_utmCampaign: key,
      },
      update: {
        sessions: { increment: zeroIfUndefined(inc.sessions) },
        users: { increment: zeroIfUndefined(inc.users) },
        signups: { increment: zeroIfUndefined(inc.signups) },
      },
      create: {
        ...key,
        sessions: zeroIfUndefined(inc.sessions),
        users: zeroIfUndefined(inc.users),
        signups: zeroIfUndefined(inc.signups),
      },
    });
  }
}
