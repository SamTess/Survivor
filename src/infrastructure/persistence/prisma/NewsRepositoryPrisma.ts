import prisma from "./client";
import { NewsRepository } from "../../repositories/NewsRepository";
import { NewsApiResponse, NewsDetailApiResponse } from "../../../domain/interfaces/News";

export class NewsRepositoryPrisma implements NewsRepository {
  async upsert(item: NewsApiResponse | NewsDetailApiResponse): Promise<void> {
    if (item.startup_id == null) {
      // Impossible d'insérer sans startup_id (contrainte NOT NULL). On ignore.
      return;
    }
    await prisma.s_NEWS.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        description: (item as NewsDetailApiResponse).description,
        news_date: item.news_date ? new Date(item.news_date) : null,
        location: item.location,
        category: item.category,
        startup_id: item.startup_id,
      },
      create: {
        id: item.id,
        title: item.title,
        description: (item as NewsDetailApiResponse).description,
        news_date: item.news_date ? new Date(item.news_date) : null,
        location: item.location,
        category: item.category,
        startup_id: item.startup_id,
      },
    });
  }

  async saveImage(newsId: number, data: Buffer): Promise<void> {
    await prisma.s_NEWS.update({ where: { id: newsId }, data: { image_data: data } });
  }
}
