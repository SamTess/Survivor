import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Prisma mock shape minimal
const prismaMock = {
  s_LIKE: { upsert: vi.fn(), count: vi.fn(), delete: vi.fn(), findUnique: vi.fn() },
  s_STARTUP: { update: vi.fn() },
  s_NEWS: { update: vi.fn() },
  s_EVENT: { update: vi.fn() },
  s_BOOKMARK: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
  s_FOLLOW: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
  s_USER: { update: vi.fn() },
};

vi.mock('@/infrastructure/persistence/prisma/client', () => ({ default: prismaMock }));
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => prismaMock),
  ContentType: { STARTUP:'STARTUP', NEWS:'NEWS', EVENT:'EVENT', USER:'USER' }
}));
vi.mock('@/domain/enums/Analytics', () => ({ ContentType: { STARTUP:'STARTUP', NEWS:'NEWS', EVENT:'EVENT', USER:'USER' } }));

describe('Interactions API', () => {
  beforeEach(() => { Object.values(prismaMock).forEach(ns => { if (typeof ns === 'object') Object.values(ns).forEach(fn => typeof fn === 'function' && fn.mockReset()); }); });

  describe('Likes', () => {
    it('POST like STARTUP', async () => {
      prismaMock.s_LIKE.upsert.mockResolvedValue({});
      prismaMock.s_LIKE.count.mockResolvedValue(3);
      prismaMock.s_STARTUP.update.mockResolvedValue({ id:1, likesCount:3 });
      const { POST } = await import('../../app/api/likes/route');
      const req = new NextRequest('http://localhost/api/likes', { method:'POST', body: JSON.stringify({ userId:1, contentType:'STARTUP', contentId:1 }) });
      const res = await POST(req); const body = await res.json();
      expect(body.likeCount).toBe(3);
    });

    it('DELETE like', async () => {
      prismaMock.s_LIKE.delete.mockResolvedValue({});
      prismaMock.s_LIKE.count.mockResolvedValue(0);
      prismaMock.s_STARTUP.update.mockResolvedValue({ id:1, likesCount:0 });
      const { DELETE } = await import('../../app/api/likes/route');
      const req = new NextRequest('http://localhost/api/likes', { method:'DELETE', body: JSON.stringify({ userId:1, contentType:'STARTUP', contentId:1 }) });
      const res = await DELETE(req); const body = await res.json();
      expect(body.likeCount).toBe(0);
    });

    it('GET status liked', async () => {
      prismaMock.s_LIKE.findUnique.mockResolvedValue({ userId:1 });
      const { GET } = await import('../../app/api/likes/status/route');
      const req = new NextRequest('http://localhost/api/likes/status?userId=1&contentType=STARTUP&contentId=1');
      const res = await GET(req); const body = await res.json();
      expect(body.isLiked).toBe(true);
    });

    it('GET status missing params', async () => {
      const { GET } = await import('../../app/api/likes/status/route');
      const req = new NextRequest('http://localhost/api/likes/status?userId=1');
      const res = await GET(req); const body = await res.json();
      expect(res.status).toBe(400); expect(body.error).toBeDefined();
    });
  });

  describe('Bookmarks', () => {
    it('POST bookmark', async () => {
      prismaMock.s_BOOKMARK.findUnique.mockResolvedValue(null);
      prismaMock.s_BOOKMARK.create.mockResolvedValue({});
      prismaMock.s_STARTUP.update.mockResolvedValue({ id:1, bookmarksCount:5 });
      const { POST } = await import('../../app/api/bookmarks/route');
      const req = new NextRequest('http://localhost/api/bookmarks', { method:'POST', body: JSON.stringify({ userId:1, contentType:'STARTUP', contentId:1 }) });
      const res = await POST(req); const body = await res.json();
  expect(body.bookmarkCount).toBe(5);
    });

    it('status bookmarked', async () => {
      prismaMock.s_BOOKMARK.findUnique.mockResolvedValue({});
      const { GET } = await import('../../app/api/bookmarks/status/route');
      const req = new NextRequest('http://localhost/api/bookmarks/status?userId=1&contentType=STARTUP&contentId=1');
      const res = await GET(req); const body = await res.json();
  expect(body.isBookmarked).toBe(true);
    });
    it('status bookmark missing params', async () => {
      const { GET } = await import('../../app/api/bookmarks/status/route');
      const req = new NextRequest('http://localhost/api/bookmarks/status?userId=1');
      const res = await GET(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Follows', () => {
    it('POST follow', async () => {
      prismaMock.s_FOLLOW.findUnique.mockResolvedValue(null);
      prismaMock.s_FOLLOW.create.mockResolvedValue({});
      prismaMock.s_STARTUP.update.mockResolvedValue({ id:1, followersCount:7 });
      const { POST } = await import('../../app/api/follows/route');
      const req = new NextRequest('http://localhost/api/follows', { method:'POST', body: JSON.stringify({ userId:1, contentType:'STARTUP', contentId:1 }) });
      const res = await POST(req); const body = await res.json();
  expect(body.followerCount).toBe(7);
    });

    it('GET follow status', async () => {
      prismaMock.s_FOLLOW.findUnique.mockResolvedValue({});
      const { GET } = await import('../../app/api/follows/status/route');
      const req = new NextRequest('http://localhost/api/follows/status?userId=1&contentType=STARTUP&contentId=1');
      const res = await GET(req); const body = await res.json();
      expect(body.isFollowing).toBe(true);
    });
    it('GET follow status missing params', async () => {
      const { GET } = await import('../../app/api/follows/status/route');
      const req = new NextRequest('http://localhost/api/follows/status?userId=1');
      const res = await GET(req);
      expect(res.status).toBe(400);
    });
  });
});
