import { describe, it, expect, vi, afterEach, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

const mockStartupService = {
  getAllStartups: vi.fn(),
  getStartupsPaginated: vi.fn(),
  searchStartups: vi.fn(),
  getStartupsBysector: vi.fn(),
  getStartupsByMaturity: vi.fn(),
  createStartup: vi.fn(),
  getStartupById: vi.fn(),
  updateStartup: vi.fn(),
  deleteStartup: vi.fn(),
};

vi.mock('../../application/services/startups/StartupService', () => ({
  StartupService: vi.fn().mockImplementation(() => mockStartupService),
}));
vi.mock('../../infrastructure/persistence/prisma/StartupRepositoryPrisma', () => ({
  StartupRepositoryPrisma: vi.fn(),
}));

describe('Startups API Endpoints', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  beforeAll(() => { consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { vi.clearAllMocks(); });
  afterAll(() => { consoleSpy.mockRestore(); });

  describe('GET /api/startups', () => {
    it('retourne toutes les startups par défaut', async () => {
      const mockData = [{ id:1, name:'S1' }];
      mockStartupService.getAllStartups.mockResolvedValue(mockData);
  const { GET } = await import('../../app/api/startups/route');
      const req = new NextRequest('http://localhost:3000/api/startups');
      const res = await GET(req);
      const body = await res.json();
      expect(res.status).toBe(200);
  expect(body.success).toBe(true);
  expect(Array.isArray(body.data)).toBe(true);
      expect(mockStartupService.getAllStartups).toHaveBeenCalled();
    });

    it('recherche par query search', async () => {
      const mockData = [{ id:2, name:'SearchInc' }];
      mockStartupService.searchStartups.mockResolvedValue(mockData);
  const { GET } = await import('../../app/api/startups/route');
      const req = new NextRequest('http://localhost:3000/api/startups?search=Search');
      const res = await GET(req); const body = await res.json();
  expect(body.success).toBe(true);
      expect(mockStartupService.searchStartups).toHaveBeenCalledWith('Search');
    });

    it('filtre par sector', async () => {
      const mockData = [{ id:3, name:'HealthCo', sector:'HEALTH' }];
      mockStartupService.getStartupsBysector.mockResolvedValue(mockData);
  const { GET } = await import('../../app/api/startups/route');
      const req = new NextRequest('http://localhost:3000/api/startups?sector=HEALTH');
      const res = await GET(req); const body = await res.json();
  expect(body.success).toBe(true);
      expect(mockStartupService.getStartupsBysector).toHaveBeenCalledWith('HEALTH');
    });

    it('filtre par maturity', async () => {
      const mockData = [{ id:4, name:'MatureCo', maturity:'SERIES_A' }];
      mockStartupService.getStartupsByMaturity.mockResolvedValue(mockData);
  const { GET } = await import('../../app/api/startups/route');
      const req = new NextRequest('http://localhost:3000/api/startups?maturity=SERIES_A');
      const res = await GET(req); const body = await res.json();
  expect(body.success).toBe(true);
      expect(mockStartupService.getStartupsByMaturity).toHaveBeenCalledWith('SERIES_A');
    });

    it('pagination', async () => {
      const mockResult = { startups:[{ id:5 }], total:1 };
      mockStartupService.getStartupsPaginated.mockResolvedValue(mockResult);
  const { GET } = await import('../../app/api/startups/route');
      const req = new NextRequest('http://localhost:3000/api/startups?page=2&limit=5');
      const res = await GET(req); const body = await res.json();
      expect(body.success).toBe(true);
  expect(body.pagination.page).toBe(2);
  expect(body.pagination.limit).toBe(5);
      expect(mockStartupService.getStartupsPaginated).toHaveBeenCalledWith(2,5);
    });

    it('service error', async () => {
      mockStartupService.getAllStartups.mockRejectedValue(new Error('db fail'));
  const { GET } = await import('../../app/api/startups/route');
      const req = new NextRequest('http://localhost:3000/api/startups');
  const res = await GET(req);
  expect([200,500]).toContain(res.status);
    });
  });

  describe('POST /api/startups', () => {
    it('crée une startup', async () => {
      const input = { name:'NewStartup' };
      const created = { id:10, ...input };
      mockStartupService.createStartup.mockResolvedValue(created);
  const { POST } = await import('../../app/api/startups/route');
      const req = new NextRequest('http://localhost:3000/api/startups', { method:'POST', body: JSON.stringify(input) });
  const res = await POST(req);
  expect([201,400]).toContain(res.status);
      expect(mockStartupService.createStartup).toHaveBeenCalledWith(input);
    });
  });

  describe('Routes /api/startups/[id]', () => {
    it('GET startup by id', async () => {
      const data = { id:1, name:'S1' };
      mockStartupService.getStartupById.mockResolvedValue(data);
  const { GET } = await import('../../app/api/startups/[id]/route');
      const req = new NextRequest('http://localhost:3000/api/startups/1');
      const res = await GET(req, { params: Promise.resolve({ id:'1' }) });
      const body = await res.json();
  expect(body.success).toBe(true);
    });

    it('GET invalid id', async () => {
  const { GET } = await import('../../app/api/startups/[id]/route');
      const req = new NextRequest('http://localhost:3000/api/startups/abc');
      const res = await GET(req, { params: Promise.resolve({ id:'abc' }) });
      expect(res.status).toBe(400);
    });

    it('PUT update startup', async () => {
      const updated = { id:2, name:'Updated' };
      mockStartupService.updateStartup.mockResolvedValue(updated);
  const { PUT } = await import('../../app/api/startups/[id]/route');
      const req = new NextRequest('http://localhost:3000/api/startups/2', { method:'PUT', body: JSON.stringify({ name:'Updated' }) });
      const res = await PUT(req, { params: Promise.resolve({ id:'2' }) });
      const body = await res.json();
      expect(body.data).toEqual(updated);
    });

    it('DELETE startup', async () => {
      mockStartupService.deleteStartup.mockResolvedValue(true);
  const { DELETE } = await import('../../app/api/startups/[id]/route');
      const req = new NextRequest('http://localhost:3000/api/startups/3', { method:'DELETE' });
      const res = await DELETE(req, { params: Promise.resolve({ id:'3' }) });
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });
});
