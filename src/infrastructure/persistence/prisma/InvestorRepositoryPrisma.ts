import prisma from "./client";
import { InvestorRepository } from "../../../domain/repositories/InvestorRepository";
import { Investor } from "../../../domain/interfaces/Investor";

export class InvestorRepositoryPrisma implements InvestorRepository {
  private mapPrismaToInvestor(prismaInvestor: {
    id: number;
    investor_type: string | null;
    investment_focus: string | null;
    user: {
      id: number;
      email: string;
      name: string;
      description: string | null;
      phone: string | null;
      address: string;
      legal_status: string | null;
      created_at: Date;
    };
  }): Investor {
    return {
      id: prismaInvestor.id,
      email: prismaInvestor.user.email,
      name: prismaInvestor.user.name,
      description: prismaInvestor.user.description || undefined,
      phone: prismaInvestor.user.phone || undefined,
      address: prismaInvestor.user.address,
      legal_status: prismaInvestor.user.legal_status || undefined,
      investor_type: prismaInvestor.investor_type || undefined,
      investment_focus: prismaInvestor.investment_focus || undefined,
      created_at: prismaInvestor.user.created_at,
      updated_at: prismaInvestor.user.created_at, // Prisma doesn't have updated_at
    };
  }

  async create(investor: Omit<Investor, 'id' | 'created_at' | 'updated_at'>): Promise<Investor> {
    // First create or find the user
    const user = await prisma.s_USER.create({
      data: {
        email: investor.email,
        name: investor.name,
        role: 'investor',
        password_hash: '', // Should be set during registration
        address: investor.address || '',
        phone: investor.phone || null,
        legal_status: investor.legal_status || null,
        description: investor.description || null,
      },
    });

    const created = await prisma.s_INVESTOR.create({
      data: {
        user_id: user.id,
        investor_type: investor.investor_type || null,
        investment_focus: investor.investment_focus || null,
      },
      include: {
        user: true,
      },
    });

    return this.mapPrismaToInvestor(created);
  }

  async getById(id: number): Promise<Investor | null> {
    const investor = await prisma.s_INVESTOR.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!investor) return null;
    return this.mapPrismaToInvestor(investor);
  }

  async getAll(): Promise<Investor[]> {
    const investors = await prisma.s_INVESTOR.findMany({
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return investors.map(investor => this.mapPrismaToInvestor(investor));
  }

  async getByEmail(email: string): Promise<Investor | null> {
    const investor = await prisma.s_INVESTOR.findFirst({
      where: {
        user: {
          email,
        },
      },
      include: {
        user: true,
      },
    });

    if (!investor) return null;
    return this.mapPrismaToInvestor(investor);
  }

  async getByInvestorType(investorType: string): Promise<Investor[]> {
    const investors = await prisma.s_INVESTOR.findMany({
      where: { investor_type: investorType },
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return investors.map(investor => this.mapPrismaToInvestor(investor));
  }

  async getByInvestmentFocus(investmentFocus: string): Promise<Investor[]> {
    const investors = await prisma.s_INVESTOR.findMany({
      where: { investment_focus: investmentFocus },
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return investors.map(investor => this.mapPrismaToInvestor(investor));
  }

  async search(query: string): Promise<Investor[]> {
    const investors = await prisma.s_INVESTOR.findMany({
      where: {
        OR: [
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
          { user: { description: { contains: query, mode: 'insensitive' } } },
          { investor_type: { contains: query, mode: 'insensitive' } },
          { investment_focus: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return investors.map(investor => this.mapPrismaToInvestor(investor));
  }

  async update(id: number, investor: Partial<Omit<Investor, 'id' | 'created_at' | 'updated_at'>>): Promise<Investor | null> {
    try {
      const existing = await prisma.s_INVESTOR.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!existing) return null;

      // Update user fields if provided
      if (investor.email || investor.name || investor.description || investor.phone || investor.address || investor.legal_status) {
        await prisma.s_USER.update({
          where: { id: existing.user_id },
          data: {
            ...(investor.email && { email: investor.email }),
            ...(investor.name && { name: investor.name }),
            ...(investor.description !== undefined && { description: investor.description }),
            ...(investor.phone !== undefined && { phone: investor.phone }),
            ...(investor.address && { address: investor.address }),
            ...(investor.legal_status !== undefined && { legal_status: investor.legal_status }),
          },
        });
      }

      // Update investor-specific fields
      const updated = await prisma.s_INVESTOR.update({
        where: { id },
        data: {
          ...(investor.investor_type !== undefined && { investor_type: investor.investor_type }),
          ...(investor.investment_focus !== undefined && { investment_focus: investor.investment_focus }),
        },
        include: {
          user: true,
        },
      });

      return this.mapPrismaToInvestor(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const investor = await prisma.s_INVESTOR.findUnique({
        where: { id },
      });

      if (!investor) return false;

      // Delete investor record (user will be deleted by cascade if needed)
      await prisma.s_INVESTOR.delete({
        where: { id },
      });

      return true;
    } catch {
      return false;
    }
  }

  async getPaginated(page: number, limit: number): Promise<{ investors: Investor[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [investors, total] = await Promise.all([
      prisma.s_INVESTOR.findMany({
        skip,
        take: limit,
        include: {
          user: true,
        },
        orderBy: { id: 'desc' },
      }),
      prisma.s_INVESTOR.count(),
    ]);

    return {
      investors: investors.map(investor => this.mapPrismaToInvestor(investor)),
      total,
    };
  }
}
