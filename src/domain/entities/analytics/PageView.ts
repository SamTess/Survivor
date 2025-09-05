export type PageView = {
  id: string;
  occurredAt: Date;
  sessionId?: string | null;
  userId?: number | null;
  path: string;
  referrerHost?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

export type RecordPageViewInput = Omit<PageView, "id" | "occurredAt">;
