import { ContentType } from "../../enums/Analytics";

export type Session = {
  id: string;
  occurredAt: Date;
  userId?: number | null;
  contentType: ContentType;
  contentId?: number | null;
  metadata?: Record<string, unknown> | null;
  ipHash?: string | null;
  userAgent?: string | null;
  referrerHost?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
};

export type CreateSessionInput = Omit<Session, "id" | "occurredAt" | "ipHash"> & { ip?: string | null };
