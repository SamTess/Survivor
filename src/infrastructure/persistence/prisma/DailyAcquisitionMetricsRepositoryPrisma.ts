import prisma from "./client";
import { DailyAcquisitionMetricsRepository } from "../../repositories/analytics/DailyAcquisitionMetricsRepository";
import { IncrementAcquisitionMetrics } from "../../../domain/entities/analytics/DailyAcquisitionMetrics";

const zeroIfUndefined = (n?: number) => n ?? 0;

export class DailyAcquisitionMetricsRepositoryPrisma implements DailyAcquisitionMetricsRepository {
  async increment(day: Date, dims: { utmSource?: string | null; utmMedium?: string | null; utmCampaign?: string | null }, inc: IncrementAcquisitionMetrics): Promise<void> {
    const existing = await prisma.s_DAILY_ACQUISITION_METRICS.findFirst({
      where: {
        day,
        utmSource: dims.utmSource ?? null,
        utmMedium: dims.utmMedium ?? null,
        utmCampaign: dims.utmCampaign ?? null,
      },
    });
    if (!existing) {
      await prisma.s_DAILY_ACQUISITION_METRICS.create({
        data: {
          day,
            utmSource: dims.utmSource ?? null,
            utmMedium: dims.utmMedium ?? null,
            utmCampaign: dims.utmCampaign ?? null,
            sessions: zeroIfUndefined(inc.sessions),
            users: zeroIfUndefined(inc.users),
            signups: zeroIfUndefined(inc.signups),
        },
      });
    } else {
      await prisma.s_DAILY_ACQUISITION_METRICS.update({
        where: { id: existing.id },
        data: {
          sessions: { increment: zeroIfUndefined(inc.sessions) },
          users: { increment: zeroIfUndefined(inc.users) },
          signups: { increment: zeroIfUndefined(inc.signups) },
        },
      });
    }
  }
}
