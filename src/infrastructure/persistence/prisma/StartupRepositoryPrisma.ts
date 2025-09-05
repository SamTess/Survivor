import prisma from "./client";
import { StartupRepository } from "../../../domain/repositories/StartupRepository";
import { Startup } from "../../../domain/entities/Startup";

export class StartupRepositoryPrisma implements StartupRepository {
  async create(startup: Omit<Startup, 'id' | 'created_at'>): Promise<Startup> {
    const created = await prisma.s_STARTUP.create({
      data: {
        name: startup.name,
        legal_status: startup.legal_status,
        address: startup.address,
        phone: startup.phone,
        sector: startup.sector,
        maturity: startup.maturity,
        email: startup.email,
        description: startup.description,
        image_data: startup.image_data || null,
      },
    });

    return {
      id: created.id,
      name: created.name,
      legal_status: created.legal_status,
      address: created.address,
      phone: created.phone,
      sector: created.sector,
      maturity: created.maturity,
      email: created.email,
      description: created.description,
      image_data: created.image_data,
      created_at: created.created_at,
    };
  }

  async getById(id: number): Promise<Startup | null> {
    const startup = await prisma.s_STARTUP.findUnique({
      where: { id },
    });

    if (!startup) return null;

    return {
      id: startup.id,
      name: startup.name,
      legal_status: startup.legal_status,
      address: startup.address,
      phone: startup.phone,
      sector: startup.sector,
      maturity: startup.maturity,
      email: startup.email,
      description: startup.description,
      image_data: startup.image_data,
      created_at: startup.created_at,
    };
  }

  async getAll(): Promise<Startup[]> {
    const startups = await prisma.s_STARTUP.findMany({
      orderBy: { created_at: 'desc' },
    });

    return startups.map(startup => ({
      id: startup.id,
      name: startup.name,
      legal_status: startup.legal_status,
      address: startup.address,
      phone: startup.phone,
      sector: startup.sector,
      maturity: startup.maturity,
      email: startup.email,
      description: startup.description,
      image_data: startup.image_data,
      created_at: startup.created_at,
    }));
  }

  async getByEmail(email: string): Promise<Startup | null> {
    const startup = await prisma.s_STARTUP.findFirst({
      where: { email },
    });

    if (!startup) return null;

    return {
      id: startup.id,
      name: startup.name,
      legal_status: startup.legal_status,
      address: startup.address,
      phone: startup.phone,
      sector: startup.sector,
      maturity: startup.maturity,
      email: startup.email,
      description: startup.description,
      image_data: startup.image_data,
      created_at: startup.created_at,
    };
  }

  async getBySector(sector: string): Promise<Startup[]> {
    const startups = await prisma.s_STARTUP.findMany({
      where: { sector },
      orderBy: { created_at: 'desc' },
    });

    return startups.map(startup => ({
      id: startup.id,
      name: startup.name,
      legal_status: startup.legal_status,
      address: startup.address,
      phone: startup.phone,
      sector: startup.sector,
      maturity: startup.maturity,
      email: startup.email,
      description: startup.description,
      image_data: startup.image_data,
      created_at: startup.created_at,
    }));
  }

  async getByMaturity(maturity: string): Promise<Startup[]> {
    const startups = await prisma.s_STARTUP.findMany({
      where: { maturity },
      orderBy: { created_at: 'desc' },
    });

    return startups.map(startup => ({
      id: startup.id,
      name: startup.name,
      legal_status: startup.legal_status,
      address: startup.address,
      phone: startup.phone,
      sector: startup.sector,
      maturity: startup.maturity,
      email: startup.email,
      description: startup.description,
      image_data: startup.image_data,
      created_at: startup.created_at,
    }));
  }

  async search(query: string): Promise<Startup[]> {
    const startups = await prisma.s_STARTUP.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { sector: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { created_at: 'desc' },
    });

    return startups.map(startup => ({
      id: startup.id,
      name: startup.name,
      legal_status: startup.legal_status,
      address: startup.address,
      phone: startup.phone,
      sector: startup.sector,
      maturity: startup.maturity,
      email: startup.email,
      description: startup.description,
      image_data: startup.image_data,
      created_at: startup.created_at,
    }));
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Startup[]> {
    const startups = await prisma.s_STARTUP.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return startups.map(startup => ({
      id: startup.id,
      name: startup.name,
      legal_status: startup.legal_status,
      address: startup.address,
      phone: startup.phone,
      sector: startup.sector,
      maturity: startup.maturity,
      email: startup.email,
      description: startup.description,
      image_data: startup.image_data,
      created_at: startup.created_at,
    }));
  }

  async update(id: number, startup: Partial<Omit<Startup, 'id' | 'created_at'>>): Promise<Startup | null> {
    try {
      const updated = await prisma.s_STARTUP.update({
        where: { id },
        data: {
          ...(startup.name && { name: startup.name }),
          ...(startup.legal_status && { legal_status: startup.legal_status }),
          ...(startup.address && { address: startup.address }),
          ...(startup.phone && { phone: startup.phone }),
          ...(startup.sector && { sector: startup.sector }),
          ...(startup.maturity && { maturity: startup.maturity }),
          ...(startup.email && { email: startup.email }),
          ...(startup.description && { description: startup.description }),
          ...(startup.image_data !== undefined && { image_data: startup.image_data }),
        },
      });

      return {
        id: updated.id,
        name: updated.name,
        legal_status: updated.legal_status,
        address: updated.address,
        phone: updated.phone,
        sector: updated.sector,
        maturity: updated.maturity,
        email: updated.email,
        description: updated.description,
        image_data: updated.image_data,
        created_at: updated.created_at,
      };
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.s_STARTUP.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getPaginated(page: number, limit: number): Promise<{ startups: Startup[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [startups, total] = await Promise.all([
      prisma.s_STARTUP.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.s_STARTUP.count(),
    ]);

    return {
      startups: startups.map(startup => ({
        id: startup.id,
        name: startup.name,
        legal_status: startup.legal_status,
        address: startup.address,
        phone: startup.phone,
        sector: startup.sector,
        maturity: startup.maturity,
        email: startup.email,
        description: startup.description,
        image_data: startup.image_data,
        created_at: startup.created_at,
      })),
      total,
    };
  }
}
