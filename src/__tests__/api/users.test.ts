import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockUserService = {
  getAllUsers: vi.fn(),
  getUsersPaginated: vi.fn(),
  searchUsers: vi.fn(),
  getFounders: vi.fn(),
  getInvestors: vi.fn(),
  getUsersByRole: vi.fn(),
  createUser: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
};

vi.mock('../../application/services/users/UserService', () => ({
  UserService: vi.fn().mockImplementation(() => mockUserService),
}));
vi.mock('../../infrastructure/persistence/prisma/UserRepositoryPrisma', () => ({
  UserRepositoryPrisma: vi.fn(),
}));

describe('Users API Endpoints', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  beforeAll(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => { vi.clearAllMocks(); });
  afterAll(() => { consoleSpy.mockRestore(); });

  describe('GET /api/users', () => {
    it('returns all users', async () => {
      const users = [
        { id:1, name:'John Doe', email:'john@example.com', role:'FOUNDER' },
        { id:2, name:'Jane Smith', email:'jane@example.com', role:'INVESTOR' },
      ];
      mockUserService.getAllUsers.mockResolvedValue(users);
      const { GET } = await import('../../app/api/users/route');
      const req = new NextRequest('http://localhost/api/users');
      const res = await GET(req); const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data).toEqual(users);
    });

    it('pagination', async () => {
      const result = { users:[{ id:1 }], total:1, hasMore:false };
      mockUserService.getUsersPaginated.mockResolvedValue(result);
      const { GET } = await import('../../app/api/users/route');
      const req = new NextRequest('http://localhost/api/users?page=1&limit=5');
      const res = await GET(req); const body = await res.json();
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(5);
      expect(body.pagination.total).toBe(1);
      expect(body.pagination.totalPages).toBe(1);
    });

    it('search', async () => {
      mockUserService.searchUsers.mockResolvedValue([{ id:1 }]);
      const { GET } = await import('../../app/api/users/route');
      const req = new NextRequest('http://localhost/api/users?search=abc');
      const res = await GET(req); const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(mockUserService.searchUsers).toHaveBeenCalledWith('abc');
    });

    it('founders', async () => {
      mockUserService.getFounders.mockResolvedValue([{ id:1 }]);
      const { GET } = await import('../../app/api/users/route');
      const req = new NextRequest('http://localhost/api/users?founders=true');
      const res = await GET(req); const body = await res.json();
      expect(body.data).toHaveLength(1);
    });

    it('investors', async () => {
      mockUserService.getInvestors.mockResolvedValue([{ id:2 }]);
      const { GET } = await import('../../app/api/users/route');
      const req = new NextRequest('http://localhost/api/users?investors=true');
      const res = await GET(req); const body = await res.json();
      expect(body.data[0].id).toBe(2);
    });

    it('role filter', async () => {
      mockUserService.getUsersByRole.mockResolvedValue([{ id:3, role:'FOUNDER' }]);
      const { GET } = await import('../../app/api/users/route');
      const req = new NextRequest('http://localhost/api/users?role=FOUNDER');
      const res = await GET(req); const body = await res.json();
      expect(body.data[0].role).toBe('FOUNDER');
    });

    it('service error', async () => {
      mockUserService.getAllUsers.mockRejectedValue(new Error('Database error'));
      const { GET } = await import('../../app/api/users/route');
      const req = new NextRequest('http://localhost/api/users');
      const res = await GET(req); const body = await res.json();
      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Database error');
    });
  });

  describe('POST /api/users', () => {
    it('create user', async () => {
      const input = { name:'John', email:'john@example.com', role:'FOUNDER' };
      const created = { id:10, ...input };
      mockUserService.createUser.mockResolvedValue(created);
      const { POST } = await import('../../app/api/users/route');
      const req = new NextRequest('http://localhost/api/users', { method:'POST', body: JSON.stringify(input) });
      const res = await POST(req); const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.data).toEqual(created);
    });
  });
});
