import { describe, it, expect, vi, afterEach, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

const mockNewsService = {
  getAllNews: vi.fn(),
  getNewsPaginated: vi.fn(),
  searchNews: vi.fn(),
  getNewsByStartupId: vi.fn(),
  getNewsByCategory: vi.fn(),
  getNewsByDateRange: vi.fn(),
  createNews: vi.fn(),
  getNewsById: vi.fn(),
  updateNews: vi.fn(),
  deleteNews: vi.fn(),
};

vi.mock('../../application/services/news/NewsService', () => ({
  NewsService: vi.fn().mockImplementation(() => mockNewsService),
}));
vi.mock('../../infrastructure/persistence/prisma/NewsRepositoryPrisma', () => ({
  NewsRepositoryPrisma: vi.fn(),
}));

describe('News API Endpoints', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  beforeAll(() => { consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => vi.clearAllMocks());
  afterAll(() => { consoleSpy.mockRestore(); });

  describe('GET /api/news', () => {
    it('default all news', async () => {
      const data = [{ id:1, title:'N1' }];
      mockNewsService.getAllNews.mockResolvedValue(data);
      const { GET } = await import('../../app/api/news/route');
      const req = new NextRequest('http://localhost:3000/api/news');
      const res = await GET(req); const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.data).toEqual(data);
    });

    it('search', async () => {
      const data = [{ id:2, title:'SearchTitle' }];
      mockNewsService.searchNews.mockResolvedValue(data);
      const { GET } = await import('../../app/api/news/route');
      const req = new NextRequest('http://localhost:3000/api/news?search=Search');
      const res = await GET(req); const body = await res.json();
      expect(body.data).toEqual(data);
      expect(mockNewsService.searchNews).toHaveBeenCalledWith('Search');
    });

    it('filter by startupId', async () => {
      const data = [{ id:3, startupId:10 }];
      mockNewsService.getNewsByStartupId.mockResolvedValue(data);
      const { GET } = await import('../../app/api/news/route');
      const req = new NextRequest('http://localhost:3000/api/news?startupId=10');
      const res = await GET(req); const body = await res.json();
      expect(body.data).toEqual(data);
      expect(mockNewsService.getNewsByStartupId).toHaveBeenCalledWith(10);
    });

    it('invalid startupId', async () => {
      const { GET } = await import('../../app/api/news/route');
      const req = new NextRequest('http://localhost:3000/api/news?startupId=abc');
      const res = await GET(req); const body = await res.json();
  expect(res.status).toBe(400); expect(body.success).toBe(false);
  expect(body.error).toBe('Invalid startup ID');
    });

    it('filter by category', async () => {
      const data = [{ id:4, category:'PRESS' }];
      mockNewsService.getNewsByCategory.mockResolvedValue(data);
      const { GET } = await import('../../app/api/news/route');
      const req = new NextRequest('http://localhost:3000/api/news?category=PRESS');
      const res = await GET(req); const body = await res.json();
      expect(body.data).toEqual(data);
      expect(mockNewsService.getNewsByCategory).toHaveBeenCalledWith('PRESS');
    });

    it('filter by date range', async () => {
      const data = [{ id:5, date:'2025-01-01' }];
      mockNewsService.getNewsByDateRange.mockResolvedValue(data);
      const { GET } = await import('../../app/api/news/route');
      const req = new NextRequest('http://localhost:3000/api/news?startDate=2025-01-01&endDate=2025-02-01');
      const res = await GET(req); const body = await res.json();
      expect(body.data).toEqual(data);
      expect(mockNewsService.getNewsByDateRange).toHaveBeenCalled();
    });

    it('invalid date range', async () => {
      const { GET } = await import('../../app/api/news/route');
      const req = new NextRequest('http://localhost:3000/api/news?startDate=bad&endDate=2025-02-01');
      const res = await GET(req); const body = await res.json();
  expect(res.status).toBe(400); expect(body.success).toBe(false);
  expect(body.error).toBe('Invalid date format');
    });

    it('pagination', async () => {
      const result = { news:[{ id:6 }], total:1 };
      mockNewsService.getNewsPaginated.mockResolvedValue(result);
      const { GET } = await import('../../app/api/news/route');
      const req = new NextRequest('http://localhost:3000/api/news?page=2&limit=5');
      const res = await GET(req); const body = await res.json();
      expect(body.pagination.page).toBe(2);
      expect(mockNewsService.getNewsPaginated).toHaveBeenCalledWith(2,5);
    });
  });

  describe('POST /api/news', () => {
    it('create news', async () => {
      const input = { title:'New', content:'Body' };
      const created = { id:11, ...input };
      mockNewsService.createNews.mockResolvedValue(created);
      const { POST } = await import('../../app/api/news/route');
      const req = new NextRequest('http://localhost:3000/api/news', { method:'POST', body: JSON.stringify(input) });
      const res = await POST(req); const body = await res.json();
      expect(res.status).toBe(201); expect(body.data).toEqual(created);
    });
  });
});
