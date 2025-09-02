import { DailyAcquisitionMetrics, IncrementAcquisitionMetrics } from "../../../domain/entities/analytics/DailyAcquisitionMetrics";

export interface DailyAcquisitionMetricsRepository {
  increment(day: Date, dims: { utmSource?: string | null; utmMedium?: string | null; utmCampaign?: string | null }, inc: IncrementAcquisitionMetrics): Promise<void>;
}
