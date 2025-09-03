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
    // Génère un token sécurisé
    const token = randomBytes(32).toString('hex');
    
    // Token expire dans 72 heures
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    // Invalide tous les anciens tokens pour cet utilisateur
    await prisma.s_PASSWORD_RESET.updateMany({
      where: { user_id: userId, used: false },
      data: { used: true }
    });

    // Crée le nouveau token
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
    console.log('🔍 PasswordResetService.validateResetToken - Token:', token);
    
    const resetRecord = await prisma.s_PASSWORD_RESET.findFirst({
      where: {
        token,
        used: false,
        expires_at: {
          gte: new Date()
        }
      }
    });

    console.log('🔍 Record trouvé:', resetRecord);

    if (!resetRecord) {
      // Vérifions si le token existe même expiré
      const anyRecord = await prisma.s_PASSWORD_RESET.findFirst({
        where: { token }
      });
      console.log('🔍 Token expiré/utilisé trouvé:', anyRecord);
      
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
