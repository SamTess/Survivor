import prisma from "./client";
import { InteractionEventRepository } from "../../repositories/analytics/InteractionEventRepository";
import { InteractionEvent, RecordInteractionInput } from "../../../domain/entities/analytics/InteractionEvent";
import crypto from "crypto";

const hashIp = (ip?: string | null) => (ip ? crypto.createHash("sha256").update(ip).digest("hex") : undefined);

export class InteractionEventRepositoryPrisma implements InteractionEventRepository {
  async record(data: RecordInteractionInput): Promise<InteractionEvent> {
    const row = await prisma.s_INTERACTION_EVENT.create({
      data: {
        userId: data.userId ?? null,
        sessionId: data.sessionId ?? null,
        eventType: data.eventType as unknown as typeof data.eventType,
        contentType: data.contentType as unknown as typeof data.contentType,
        contentId: data.contentId ?? null,
        metadata: data.metadata == null ? undefined : (data.metadata as unknown as object),
        ipHash: hashIp(data.ip) ?? null,
        userAgent: data.userAgent ?? null,
        referrerHost: data.referrerHost ?? null,
        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        utmTerm: data.utmTerm ?? null,
        utmContent: data.utmContent ?? null,
      },
    });
    return row as unknown as InteractionEvent;
  }
}
