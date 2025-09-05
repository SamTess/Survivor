import prisma from "./../client";
import { InteractionEventRepository } from "../../../repositories/analytics/InteractionEventRepository";
import { InteractionEvent, RecordInteractionInput } from "../../../../domain/entities/analytics/InteractionEvent";
import { hashIp } from "../../../security/hashIp";
import { EventType as DomainEventType, ContentType as DomainContentType } from "../../../../domain/enums/Analytics";
import { $Enums } from '@prisma/client';

function mapEventType(e: DomainEventType): $Enums.EventType {
  return e as unknown as $Enums.EventType; // valeurs identiques dans le schema
}

function mapContentType(c: DomainContentType): $Enums.ContentType {
  return c as unknown as $Enums.ContentType;
}

export class InteractionEventRepositoryPrisma implements InteractionEventRepository {
  async record(data: RecordInteractionInput): Promise<InteractionEvent> {
  const ipHash = await hashIp(data.ip);
  const row = await prisma.s_INTERACTION_EVENT.create({
      data: {
        userId: data.userId ?? null,
        sessionId: data.sessionId ?? null,
        eventType: mapEventType(data.eventType as DomainEventType),
        contentType: mapContentType(data.contentType as DomainContentType),
        contentId: data.contentId ?? null,
        metadata: data.metadata == null ? undefined : (data.metadata as unknown as object),
        ipHash: ipHash ?? null,
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
