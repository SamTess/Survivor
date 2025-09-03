import { describe, it, expect, beforeEach, vi } from 'vitest';

// Use vi.hoisted to declare mocks
const mockPrisma = vi.hoisted(() => ({
  s_PASSWORD_RESET: {
    updateMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

// Mock Prisma Client et global
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Mock global pour que le service utilise notre mock
interface GlobalWithPrisma {
  prisma?: typeof mockPrisma;
}
const mockGlobal = global as unknown as GlobalWithPrisma;
mockGlobal.prisma = mockPrisma;

// Ensuite importer le service
import { PasswordResetService } from '../../infrastructure/services/PasswordResetService';

describe('PasswordResetService', () => {
  let service: PasswordResetService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PasswordResetService();
  });

  describe('createResetToken', () => {
    it('should create a reset token with 72h expiration', async () => {
      const userId = 1;
      mockPrisma.s_PASSWORD_RESET.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.s_PASSWORD_RESET.create.mockResolvedValue({
        id: 1,
        user_id: userId,
        token: 'mock-token',
        expires_at: new Date(),
        used: false,
      });

      const token = await service.createResetToken(userId);

      expect(token).toMatch(/^[a-f0-9]{64}$/); // 32 bytes = 64 hex chars
      expect(mockPrisma.s_PASSWORD_RESET.updateMany).toHaveBeenCalledWith({
        where: { user_id: userId, used: false },
        data: { used: true },
      });
      
      expect(mockPrisma.s_PASSWORD_RESET.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: userId,
          token: expect.any(String),
          expires_at: expect.any(Date),
        }),
      });
    });

    it('should invalidate existing tokens before creating new one', async () => {
      const userId = 1;
      mockPrisma.s_PASSWORD_RESET.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.s_PASSWORD_RESET.create.mockResolvedValue({});

      await service.createResetToken(userId);

      expect(mockPrisma.s_PASSWORD_RESET.updateMany).toHaveBeenCalledBefore(
        mockPrisma.s_PASSWORD_RESET.create
      );
    });
  });

  describe('validateResetToken', () => {
    it('should return valid: true for valid token', async () => {
      const token = 'valid-token';
      const userId = 1;
      
      mockPrisma.s_PASSWORD_RESET.findFirst.mockResolvedValue({
        id: 1,
        user_id: userId,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
        used: false,
      });

      const result = await service.validateResetToken(token);

      expect(result).toEqual({ userId, valid: true });
      expect(mockPrisma.s_PASSWORD_RESET.findFirst).toHaveBeenCalledWith({
        where: {
          token,
          used: false,
          expires_at: {
            gte: expect.any(Date),
          },
        },
      });
    });

    it('should return valid: false for expired token', async () => {
      const token = 'expired-token';
      
      mockPrisma.s_PASSWORD_RESET.findFirst.mockResolvedValue(null);

      const result = await service.validateResetToken(token);

      expect(result).toEqual({ userId: 0, valid: false });
    });

    it('should return valid: false for used token', async () => {
      const token = 'used-token';
      
      mockPrisma.s_PASSWORD_RESET.findFirst.mockResolvedValue(null);

      const result = await service.validateResetToken(token);

      expect(result).toEqual({ userId: 0, valid: false });
    });
  });

  describe('useResetToken', () => {
    it('should mark token as used and return true if successful', async () => {
      const token = 'valid-token';
      mockPrisma.s_PASSWORD_RESET.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.useResetToken(token);

      expect(result).toBe(true);
      expect(mockPrisma.s_PASSWORD_RESET.updateMany).toHaveBeenCalledWith({
        where: {
          token,
          used: false,
          expires_at: {
            gte: expect.any(Date),
          },
        },
        data: { used: true },
      });
    });

    it('should return false if no token was updated', async () => {
      const token = 'invalid-token';
      mockPrisma.s_PASSWORD_RESET.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.useResetToken(token);

      expect(result).toBe(false);
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens and return count', async () => {
      const deletedCount = 5;
      mockPrisma.s_PASSWORD_RESET.deleteMany.mockResolvedValue({ count: deletedCount });

      const result = await service.cleanupExpiredTokens();

      expect(result).toBe(deletedCount);
      expect(mockPrisma.s_PASSWORD_RESET.deleteMany).toHaveBeenCalledWith({
        where: {
          expires_at: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });
});
