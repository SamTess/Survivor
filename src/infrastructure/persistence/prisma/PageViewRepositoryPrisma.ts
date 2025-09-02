import prisma from "./client";
import { PageViewRepository } from "../../repositories/analytics/PageViewRepository";
import { PageView, RecordPageViewInput } from "../../../domain/entities/analytics/PageView";

export class PageViewRepositoryPrisma implements PageViewRepository {
  async record(data: RecordPageViewInput): Promise<PageView> {
    const row = await prisma.s_PAGE_VIEW.create({
      data: {
        sessionId: data.sessionId ?? null,
        userId: data.userId ?? null,
        path: data.path,
        referrerHost: data.referrerHost ?? null,
        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
      },
    });
    return row as unknown as PageView;
  }
}
