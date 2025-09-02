import { IncrementContentMetrics } from "../../../domain/entities/analytics/DailyContentMetrics";
import { ContentType } from "../../../domain/enums/Analytics";

export interface DailyContentMetricsRepository {
  increment(day: Date, contentType: ContentType, contentId: number, inc: IncrementContentMetrics): Promise<void>;
}
