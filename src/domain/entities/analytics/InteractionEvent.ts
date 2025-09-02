import { ContentType, EventType } from "../../enums/Analytics";

export type InteractionEvent = {
  id: string;
  occurredAt: Date;
  userId?: number | null;
  sessionId?: string | null;
  eventType: EventType;
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

export type RecordInteractionInput = Omit<InteractionEvent, "id" | "occurredAt" | "ipHash"> & { ip?: string | null };
