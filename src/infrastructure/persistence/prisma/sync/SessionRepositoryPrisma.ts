import prisma from "../client";
import { SessionRepository } from "../../../repositories/analytics/SessionRepository";
import { CreateSessionInput, Session } from "../../../../domain/entities/analytics/Session";
import crypto from "crypto";

const hashIp = (ip?: string | null) => (ip ? crypto.createHash("sha256").update(ip).digest("hex") : undefined);

export class SessionRepositoryPrisma implements SessionRepository {
  async create(data: CreateSessionInput): Promise<Session> {
    const row = await prisma.s_SESSION.create({
      data: {
        userId: data.userId ?? null,
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
    return row as unknown as Session;
  }

  async findById(id: string): Promise<Session | null> {
    const row = await prisma.s_SESSION.findUnique({ where: { id } });
    return (row as unknown as Session) ?? null;
  }
}
