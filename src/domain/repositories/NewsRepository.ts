import { News } from "../entities/News";

export interface NewsRepository {
  // Create
  create(news: Omit<News, 'id' | 'created_at' | 'startup'>): Promise<News>;
  
  // Read
  getById(id: number): Promise<News | null>;
  getAll(): Promise<News[]>;
  getByStartupId(startupId: number): Promise<News[]>;
  getByCategory(category: string): Promise<News[]>;
  getByDateRange(startDate: Date, endDate: Date): Promise<News[]>;
  search(query: string): Promise<News[]>;
  
  // Update
  update(id: number, news: Partial<Omit<News, 'id' | 'created_at' | 'startup'>>): Promise<News | null>;
  
  // Delete
  delete(id: number): Promise<boolean>;
  
  // Pagination
  getPaginated(page: number, limit: number): Promise<{ news: News[], total: number }>;
}
