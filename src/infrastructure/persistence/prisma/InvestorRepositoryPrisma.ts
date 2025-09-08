import prisma from "./client";
import { InvestorRepository } from "../../../domain/repositories/InvestorRepository";
import { Investor } from "../../../domain/interfaces/Investor";
import { Prisma } from "@prisma/client";

export class InvestorRepositoryPrisma implements InvestorRepository {
  private mapPrismaToInvestor(prismaInvestor: Prisma.S_INVESTORGetPayload<{ include: { user: true } }>): Investor {
    const u = prismaInvestor.user;
    return {
      id: prismaInvestor.id,
      email: u?.email || "",
      name: u?.name || "",
      description: u?.description || undefined,
      phone: u?.phone || undefined,
      address: u?.address || undefined,
      legal_status: u?.legal_status || undefined,
      investor_type: prismaInvestor.investor_type || undefined,
      investment_focus: prismaInvestor.investment_focus || undefined,
      created_at: u?.created_at || new Date(0),
      updated_at: u?.created_at || new Date(0),
    };
  }

  async create(investor: Omit<Investor, 'id' | 'created_at' | 'updated_at'>): Promise<Investor> {
    // Check if user already exists
    let user = await prisma.s_USER.findFirst({
      where: { email: investor.email }
    });

    if (!user) {
      user = await prisma.s_USER.create({
        data: {
          email: investor.email,
          name: investor.name,
          role: 'investor',
          password_hash: '',
          address: investor.address || '',
          phone: investor.phone || null,
          legal_status: investor.legal_status || null,
          description: investor.description || null,
        },
      });
    }

    const created = await prisma.s_INVESTOR.create({
      data: {
        name: investor.name,
        legal_status: investor.legal_status || "",
        address: investor.address || "",
        email: investor.email,
        phone: investor.phone || "",
        description: investor.description || "",
        investor_type: investor.investor_type || null,
        investment_focus: investor.investment_focus || null,
        user: { connect: { id: user.id } },
      },
      include: { user: true },
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
    const investors: Investor[] = await prisma.s_INVESTOR.findMany({
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

  async getByUserId(userId: number): Promise<Investor | null> {
    const investor = await prisma.s_INVESTOR.findFirst({
      where: { user_id: userId },
      include: {
        user: true,
      },
    });

    if (!investor) return null;
    return this.mapPrismaToInvestor(investor);
  }

  async getByInvestorType(investorType: string): Promise<Investor[]> {
    const investors: Investor[] = await prisma.s_INVESTOR.findMany({
      where: { investor_type: investorType },
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return investors.map(investor => this.mapPrismaToInvestor(investor));
  }

  async getByInvestmentFocus(investmentFocus: string): Promise<Investor[]> {
    const investors: Investor[] = await prisma.s_INVESTOR.findMany({
      where: { investment_focus: investmentFocus },
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return investors.map(investor => this.mapPrismaToInvestor(investor));
  }

  async search(query: string): Promise<Investor[]> {
    const investors: Investor[] = await prisma.s_INVESTOR.findMany({
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
      if (existing.user_id && (investor.email || investor.name || investor.description || investor.phone || investor.address || investor.legal_status)) {
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

    const [investors, total]: [Investor[], number] = await Promise.all([
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
