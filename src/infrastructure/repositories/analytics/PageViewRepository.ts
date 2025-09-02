import { PageView, RecordPageViewInput } from "../../../domain/entities/analytics/PageView";

export interface PageViewRepository {
  record(data: RecordPageViewInput): Promise<PageView>;
}
