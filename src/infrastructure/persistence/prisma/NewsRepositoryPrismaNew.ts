import prisma from "./client";
import { NewsRepository } from "../../../domain/repositories/NewsRepository";
import { News } from "../../../domain/entities/News";
import { S_NEWS, S_STARTUP } from "@prisma/client";

export class NewsRepositoryPrisma implements NewsRepository {
  private mapPrismaToNews(prismaNews: S_NEWS & { startup: S_STARTUP }): News {
    return {
      id: prismaNews.id,
      title: prismaNews.title,
      description: prismaNews.description || undefined,
      image_data: prismaNews.image_data,
      startup_id: prismaNews.startup_id,
      news_date: prismaNews.news_date || undefined,
      location: prismaNews.location || undefined,
      category: prismaNews.category || undefined,
      created_at: prismaNews.created_at,
      startup: {
        id: prismaNews.startup.id,
        name: prismaNews.startup.name,
        legal_status: prismaNews.startup.legal_status,
        address: prismaNews.startup.address,
        phone: prismaNews.startup.phone,
        sector: prismaNews.startup.sector,
        maturity: prismaNews.startup.maturity,
        email: prismaNews.startup.email,
        description: prismaNews.startup.description,
        image_data: prismaNews.startup.image_data,
        created_at: prismaNews.startup.created_at,
      },
    };
  }

  async create(news: Omit<News, 'id' | 'created_at' | 'startup'>): Promise<News> {
    const created = await prisma.s_NEWS.create({
      data: {
        title: news.title,
        description: news.description || null,
        image_data: news.image_data || null,
        startup_id: news.startup_id,
        news_date: news.news_date || null,
        location: news.location || null,
        category: news.category || null,
      },
      include: {
        startup: true,
      },
    });

    return this.mapPrismaToNews(created);
  }

  async getById(id: number): Promise<News | null> {
    const news = await prisma.s_NEWS.findUnique({
      where: { id },
      include: {
        startup: true,
      },
    });

    if (!news) return null;
    return this.mapPrismaToNews(news);
  }

  async getAll(): Promise<News[]> {
    const newsList = await prisma.s_NEWS.findMany({
      include: {
        startup: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return newsList.map(news => this.mapPrismaToNews(news));
  }

  async getByStartupId(startupId: number): Promise<News[]> {
    const newsList = await prisma.s_NEWS.findMany({
      where: { startup_id: startupId },
      include: {
        startup: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return newsList.map(news => this.mapPrismaToNews(news));
  }

  async getByCategory(category: string): Promise<News[]> {
    const newsList = await prisma.s_NEWS.findMany({
      where: { category },
      include: {
        startup: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return newsList.map(news => this.mapPrismaToNews(news));
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<News[]> {
    const newsList = await prisma.s_NEWS.findMany({
      where: {
        news_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        startup: true,
      },
      orderBy: { news_date: 'desc' },
    });

    return newsList.map(news => this.mapPrismaToNews(news));
  }

  async search(query: string): Promise<News[]> {
    const newsList = await prisma.s_NEWS.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        startup: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return newsList.map(news => this.mapPrismaToNews(news));
  }

  async update(id: number, news: Partial<Omit<News, 'id' | 'created_at' | 'startup'>>): Promise<News | null> {
    try {
      const updated = await prisma.s_NEWS.update({
        where: { id },
        data: {
          ...(news.title && { title: news.title }),
          ...(news.description !== undefined && { description: news.description }),
          ...(news.image_data !== undefined && { image_data: news.image_data }),
          ...(news.startup_id && { startup_id: news.startup_id }),
          ...(news.news_date !== undefined && { news_date: news.news_date }),
          ...(news.location !== undefined && { location: news.location }),
          ...(news.category !== undefined && { category: news.category }),
        },
        include: {
          startup: true,
        },
      });

      return this.mapPrismaToNews(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.s_NEWS.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getPaginated(page: number, limit: number): Promise<{ news: News[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [newsList, total] = await Promise.all([
      prisma.s_NEWS.findMany({
        skip,
        take: limit,
        include: {
          startup: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.s_NEWS.count(),
    ]);

    return {
      news: newsList.map(news => this.mapPrismaToNews(news)),
      total,
    };
  }
}
