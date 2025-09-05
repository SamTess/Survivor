import prisma from "./client";
import { FounderRepository } from "../../../domain/repositories/FounderRepository";
import { Founder } from "../../../domain/interfaces/Founder";

export class FounderRepositoryPrisma implements FounderRepository {
  private mapPrismaToFounder(prismaFounder: {
    id: number;
    startup_id: number;
    user_id: number | null;
    user: {
      name: string;
      created_at: Date;
    } | null;
  }): Founder {
    return {
      id: prismaFounder.id,
      name: prismaFounder.user?.name || '',
      startup_id: prismaFounder.startup_id,
      created_at: prismaFounder.user?.created_at || new Date(0),
      updated_at: prismaFounder.user?.created_at || new Date(0),
    };
  }

  async create(founder: Omit<Founder, 'id' | 'created_at' | 'updated_at'>): Promise<Founder> {
    const user = await prisma.s_USER.findFirst({
      where: { name: founder.name },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const created = await prisma.s_FOUNDER.create({
      data: {
        startup_id: founder.startup_id,
        user_id: user.id,
      },
      include: {
        user: true,
      },
    });

    return this.mapPrismaToFounder(created);
  }

  async getById(id: number): Promise<Founder | null> {
  const founder = await prisma.s_FOUNDER.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!founder) return null;
    return this.mapPrismaToFounder(founder);
  }

  async getAll(): Promise<Founder[]> {
  const founders = await prisma.s_FOUNDER.findMany({
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return founders.map(founder => this.mapPrismaToFounder(founder));
  }

  async getByStartupId(startupId: number): Promise<Founder[]> {
  const founders = await prisma.s_FOUNDER.findMany({
      where: { startup_id: startupId },
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return founders.map(founder => this.mapPrismaToFounder(founder));
  }

  async getByUserId(userId: number): Promise<Founder[]> {
  const founders = await prisma.s_FOUNDER.findMany({
      where: { user_id: userId },
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return founders.map(founder => this.mapPrismaToFounder(founder));
  }

  async update(id: number, founder: Partial<Omit<Founder, 'id' | 'created_at' | 'updated_at'>>): Promise<Founder | null> {
    try {
      const updated = await prisma.s_FOUNDER.update({
        where: { id },
        data: {
          ...(founder.startup_id && { startup_id: founder.startup_id }),
        },
        include: {
          user: true,
        },
      });

      return this.mapPrismaToFounder(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.s_FOUNDER.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteByStartupId(startupId: number): Promise<boolean> {
    try {
      await prisma.s_FOUNDER.deleteMany({
        where: { startup_id: startupId },
      });
      return true;
    } catch {
      return false;
    }
  }

  async isFounderOfStartup(userId: number, startupId: number): Promise<boolean> {
    const founder = await prisma.s_FOUNDER.findFirst({
      where: {
        user_id: userId,
        startup_id: startupId,
      },
    });

    return founder !== null;
  }
}
