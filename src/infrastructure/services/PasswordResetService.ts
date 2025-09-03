import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

interface GlobalWithPrisma {
  prisma?: PrismaClient;
}
const globalForPrisma = global as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export class PasswordResetService {
  async createResetToken(userId: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    await prisma.s_PASSWORD_RESET.updateMany({
      where: { user_id: userId, used: false },
      data: { used: true }
    });

    await prisma.s_PASSWORD_RESET.create({
      data: {
        user_id: userId,
        token,
        expires_at: expiresAt,
      }
    });

    return token;
  }

  async validateResetToken(token: string): Promise<{ userId: number; valid: boolean }> {
    
    const resetRecord = await prisma.s_PASSWORD_RESET.findFirst({
      where: {
        token,
        used: false,
        expires_at: {
          gte: new Date()
        }
      }
    });

    if (!resetRecord) {
      return { userId: 0, valid: false };
    }

    return { userId: resetRecord.user_id, valid: true };
  }

  async useResetToken(token: string): Promise<boolean> {
    const result = await prisma.s_PASSWORD_RESET.updateMany({
      where: {
        token,
        used: false,
        expires_at: {
          gte: new Date()
        }
      },
      data: { used: true }
    });

    return result.count > 0;
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.s_PASSWORD_RESET.deleteMany({
      where: {
        expires_at: {
          lt: new Date()
        }
      }
    });

    return result.count;
  }
}
