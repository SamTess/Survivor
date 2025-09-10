import { PrismaClient } from '@prisma/client';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, DEFAULT_STORAGE_QUOTA } from '@/types/media';

interface GlobalWithPrisma { prisma?: PrismaClient }
const globalForPrisma = globalThis as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export class MediaService {
  static async checkUserIsFounder(userId: number): Promise<boolean> {
    const founder = await prisma.s_FOUNDER.findFirst({
      where: { user_id: userId }
    });
    return !!founder;
  }

  static async getUserStorageUsage(userId: number): Promise<{ used: bigint, max: bigint }> {
    let quota = await prisma.s_USER_STORAGE_QUOTA.findUnique({
      where: { user_id: userId }
    });

    if (!quota) {
      quota = await prisma.s_USER_STORAGE_QUOTA.create({
        data: {
          user_id: userId,
          used_bytes: BigInt(0),
          max_bytes: BigInt(DEFAULT_STORAGE_QUOTA)
        }
      });
    }

    return { used: quota.used_bytes, max: quota.max_bytes };
  }

  static getFileType(mimeType: string): string {
    for (const [type, mimes] of Object.entries(ALLOWED_FILE_TYPES)) {
      if (mimes.includes(mimeType as never)) {
        return type;
      }
    }
    return 'other';
  }

  static isAllowedFileType(mimeType: string): boolean {
    const allMimeTypes = Object.values(ALLOWED_FILE_TYPES).flat();
    return allMimeTypes.includes(mimeType as never);
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    if (!this.isAllowedFileType(file.type)) {
      return {
        valid: false,
        error: 'File type not supported'
      };
    }

    return { valid: true };
  }

  static async checkStorageQuota(userId: number, fileSize: number): Promise<{ allowed: boolean; error?: string }> {
    const { used, max } = await this.getUserStorageUsage(userId);

    if (used + BigInt(fileSize) > max) {
      const remainingMB = Number((max - used) / BigInt(1024 * 1024));
      return {
        allowed: false,
        error: `Storage quota exceeded. You have ${remainingMB}MB remaining`
      };
    }

    return { allowed: true };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getStorageInfo(quota: { used_bytes: bigint; max_bytes: bigint }) {
    const used = Number(quota.used_bytes);
    const max = Number(quota.max_bytes);
    return {
      used,
      max,
      usedMB: used / (1024 * 1024),
      maxMB: max / (1024 * 1024),
      percentUsed: (used / max) * 100
    };
  }
}
