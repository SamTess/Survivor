import { NewsRepository } from "../../../domain/repositories/NewsRepository";
import { News } from "../../../domain/entities/News";

export class NewsService {
  constructor(private readonly newsRepository: NewsRepository) {}

  async createNews(news: Omit<News, 'id' | 'created_at' | 'startup'>): Promise<News> {
    if (!news.title || !news.startup_id) {
      throw new Error("Title and startup ID are required");
    }

    if (!Number.isInteger(news.startup_id) || news.startup_id <= 0) {
      throw new Error("Invalid startup ID");
    }

    return this.newsRepository.create(news);
  }

  async getNewsById(id: number): Promise<News | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid news ID");
    }

    return this.newsRepository.getById(id);
  }

  async getAllNews(): Promise<News[]> {
    return this.newsRepository.getAll();
  }

  async getNewsByStartupId(startupId: number): Promise<News[]> {
    if (!Number.isInteger(startupId) || startupId <= 0) {
      throw new Error("Invalid startup ID");
    }

    return this.newsRepository.getByStartupId(startupId);
  }

  async getNewsByCategory(category: string): Promise<News[]> {
    if (!category || category.trim().length === 0) {
      throw new Error("Category cannot be empty");
    }

    return this.newsRepository.getByCategory(category.trim());
  }

  async getNewsByDateRange(startDate: Date, endDate: Date): Promise<News[]> {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new Error("Invalid date format");
    }

    if (startDate > endDate) {
      throw new Error("Start date must be before end date");
    }

    return this.newsRepository.getByDateRange(startDate, endDate);
  }

  async searchNews(query: string): Promise<News[]> {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters long");
    }

    return this.newsRepository.search(query.trim());
  }

  async updateNews(id: number, updates: Partial<Omit<News, 'id' | 'created_at' | 'startup'>>): Promise<News | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid news ID");
    }

    if (updates.startup_id && (!Number.isInteger(updates.startup_id) || updates.startup_id <= 0)) {
      throw new Error("Invalid startup ID");
    }

    const existing = await this.newsRepository.getById(id);
    if (!existing) {
      throw new Error("News not found");
    }

    return this.newsRepository.update(id, updates);
  }

  async deleteNews(id: number): Promise<boolean> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid news ID");
    }

    const existing = await this.newsRepository.getById(id);
    if (!existing) {
      throw new Error("News not found");
    }

    return this.newsRepository.delete(id);
  }

  async getNewsPaginated(page: number, limit: number): Promise<{ news: News[], total: number }> {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error("Page must be a positive integer");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    return this.newsRepository.getPaginated(page, limit);
  }
}
