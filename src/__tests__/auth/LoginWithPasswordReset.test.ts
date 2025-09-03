import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock des services avec des types appropriés - utilisation de vi.hoisted
const mockPasswordResetService = vi.hoisted(() => ({
  createResetToken: vi.fn(),
  validateResetToken: vi.fn(),
  useResetToken: vi.fn(),
  cleanupExpiredTokens: vi.fn(),
}));

const mockEmailService = vi.hoisted(() => ({
  sendPasswordResetEmail: vi.fn(),
  verifyConnection: vi.fn(),
}));

const mockAuth = vi.hoisted(() => ({
  verifyPassword: vi.fn(),
  signJwt: vi.fn(),
  getAuthSecret: vi.fn(),
}));

// Mock des modules avec le bon chemin
vi.mock('../../infrastructure/services/PasswordResetService', () => ({
  PasswordResetService: vi.fn(() => mockPasswordResetService),
}));

vi.mock('../../infrastructure/services/EmailService', () => ({
  EmailService: vi.fn(() => mockEmailService),
}));

vi.mock('../../infrastructure/security/auth', () => mockAuth);

// Mock Prisma
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password_hash: '',
};

const mockPrisma = vi.hoisted(() => ({
  s_USER: {
    findFirst: vi.fn(),
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Mock global pour que le service utilise notre mock
interface GlobalWithPrisma {
  prisma?: typeof mockPrisma;
}
const mockGlobal = global as unknown as GlobalWithPrisma;
mockGlobal.prisma = mockPrisma;

describe('Login API with Password Reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock des variables d'environnement pour les tests
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('EMAIL_USER', 'test@example.com');
    vi.stubEnv('EMAIL_PASS', 'test-pass');
  });

  it('should trigger password reset when user has empty password', async () => {
    // Arrange
    mockPrisma.s_USER.findFirst.mockResolvedValue({
      ...mockUser,
      password_hash: '', // Empty password
    });

    mockPasswordResetService.createResetToken.mockResolvedValue('mock-reset-token');
    mockEmailService.sendPasswordResetEmail.mockResolvedValue(undefined);

    const { POST } = await import('../../app/api/auth/login/route');

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'any-password',
      }),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data.requiresPasswordReset).toBe(true);
    expect(data.error).toContain('Un email de création de mot de passe a été envoyé');
    expect(mockPasswordResetService.createResetToken).toHaveBeenCalledWith(1);
    expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      'john@example.com',
      'mock-reset-token',
      'John Doe'
    );
  });

  it('should handle email sending failure gracefully', async () => {
    // Arrange
    mockPrisma.s_USER.findFirst.mockResolvedValue({
      ...mockUser,
      password_hash: null, // Null password
    });

    mockPasswordResetService.createResetToken.mockResolvedValue('mock-reset-token');
    mockEmailService.sendPasswordResetEmail.mockRejectedValue(new Error('SMTP Error'));

    const { POST } = await import('../../app/api/auth/login/route');

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'any-password',
      }),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data.requiresPasswordReset).toBe(true);
    expect(data.error).toContain('contacter l\'administrateur');
    expect(mockPasswordResetService.createResetToken).toHaveBeenCalledWith(1);
    expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalled();
  });

  it('should proceed with normal login when password exists', async () => {
    // Arrange
    mockPrisma.s_USER.findFirst.mockResolvedValue({
      ...mockUser,
      password_hash: 'hashed-password', // Normal password
    });

    mockAuth.verifyPassword.mockResolvedValue(true);
    mockAuth.signJwt.mockReturnValue('mock-jwt-token');
    mockAuth.getAuthSecret.mockReturnValue('secret');

    const { POST } = await import('../../app/api/auth/login/route');

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'correct-password',
      }),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(mockAuth.verifyPassword).toHaveBeenCalledWith('correct-password', 'hashed-password');
  });
});
