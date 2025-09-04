import prisma from "./client";
import { PartnerRepository } from "../../../domain/repositories/PartnerRepository";
import { Partner } from "../../../domain/interfaces/Partner";
import { Prisma } from "@prisma/client";

export class PartnerRepositoryPrisma implements PartnerRepository {
  private mapPrismaToPartner(prismaPartner: Prisma.S_PARTNERGetPayload<{ include: { user: true } }>): Partner {
    return {
      id: prismaPartner.id,
      name: prismaPartner.user.name,
      email: prismaPartner.user.email,
      legal_status: prismaPartner.user.legal_status || undefined,
      address: prismaPartner.user.address || undefined,
      phone: prismaPartner.user.phone || undefined,
      partnership_type: prismaPartner.partnership_type || undefined,
      description: prismaPartner.user.description || undefined,
      created_at: prismaPartner.user.created_at,
      updated_at: prismaPartner.user.created_at,
    };
  }

  async create(partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<Partner> {
    // First create or find the user
    const user = await prisma.s_USER.create({
      data: {
        name: partner.name,
        email: partner.email,
        role: 'partner',
        password_hash: '',
        legal_status: partner.legal_status || null,
        address: partner.address || '',
        phone: partner.phone || null,
        description: partner.description || null,
      },
    });

    const created = await prisma.s_PARTNER.create({
      data: {
        user_id: user.id,
  name: partner.name,
  legal_status: partner.legal_status || "",
  address: partner.address || "",
  email: partner.email,
  phone: partner.phone || "",
  description: partner.description || "",
        partnership_type: partner.partnership_type || null,
      },
      include: { user: true },
    });

    return this.mapPrismaToPartner(created);
  }

  async getById(id: number): Promise<Partner | null> {
    const partner = await prisma.s_PARTNER.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!partner) return null;
    return this.mapPrismaToPartner(partner);
  }

  async getAll(): Promise<Partner[]> {
    const partners = await prisma.s_PARTNER.findMany({
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return partners.map(partner => this.mapPrismaToPartner(partner));
  }

  async getByEmail(email: string): Promise<Partner | null> {
    const partner = await prisma.s_PARTNER.findFirst({
      where: {
        user: {
          email,
        },
      },
      include: {
        user: true,
      },
    });

    if (!partner) return null;
    return this.mapPrismaToPartner(partner);
  }

  async getByPartnershipType(partnershipType: string): Promise<Partner[]> {
    const partners = await prisma.s_PARTNER.findMany({
      where: { partnership_type: partnershipType },
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return partners.map(partner => this.mapPrismaToPartner(partner));
  }

  async search(query: string): Promise<Partner[]> {
    const partners = await prisma.s_PARTNER.findMany({
      where: {
        OR: [
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
          { user: { description: { contains: query, mode: 'insensitive' } } },
          { partnership_type: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return partners.map(partner => this.mapPrismaToPartner(partner));
  }

  async update(id: number, partner: Partial<Omit<Partner, 'id' | 'created_at' | 'updated_at'>>): Promise<Partner | null> {
    try {
      const existing = await prisma.s_PARTNER.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!existing) return null;

      if (partner.name || partner.email || partner.legal_status || partner.address || partner.phone || partner.description) {
        await prisma.s_USER.update({
          where: { id: existing.user_id },
          data: {
            ...(partner.name && { name: partner.name }),
            ...(partner.email && { email: partner.email }),
            ...(partner.legal_status !== undefined && { legal_status: partner.legal_status }),
            ...(partner.address && { address: partner.address }),
            ...(partner.phone !== undefined && { phone: partner.phone }),
            ...(partner.description !== undefined && { description: partner.description }),
          },
        });
      }

      const updated = await prisma.s_PARTNER.update({
        where: { id },
        data: {
          ...(partner.partnership_type !== undefined && { partnership_type: partner.partnership_type }),
        },
        include: {
          user: true,
        },
      });

      return this.mapPrismaToPartner(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const partner = await prisma.s_PARTNER.findUnique({
        where: { id },
      });

      if (!partner) return false;

      await prisma.s_PARTNER.delete({
        where: { id },
      });

      return true;
    } catch {
      return false;
    }
  }

  async getPaginated(page: number, limit: number): Promise<{ partners: Partner[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [partners, total] = await Promise.all([
      prisma.s_PARTNER.findMany({
        skip,
        take: limit,
        include: {
          user: true,
        },
        orderBy: { id: 'desc' },
      }),
      prisma.s_PARTNER.count(),
    ]);

    return {
      partners: partners.map(partner => this.mapPrismaToPartner(partner)),
      total,
    };
  }
}
