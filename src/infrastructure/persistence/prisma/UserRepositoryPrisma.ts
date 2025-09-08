import prisma from "./client";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { User } from "../../../domain/interfaces/User";

export class UserRepositoryPrisma implements UserRepository {
  private mapPrismaToUser(prismaUser: {
    id: number;
    name: string;
    email: string;
    role: string;
    address: string | null;
    phone: string | null;
    legal_status: string | null;
    description: string | null;
    created_at: Date;
    updated_at?: Date;
    founders?: Array<{ id: number }>;
    investors?: Array<{ id: number }>;
  }): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role,
      address: prismaUser.address || undefined,
      phone: prismaUser.phone || undefined,
      legal_status: prismaUser.legal_status || undefined,
      description: prismaUser.description || undefined,
      founder_id: prismaUser.founders?.[0]?.id,
      investor_id: prismaUser.investors?.[0]?.id,
      created_at: prismaUser.created_at,
      updated_at: prismaUser.updated_at ?? prismaUser.created_at,
    };
  }

  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    // Check if user already exists
    const existingUser = await prisma.s_USER.findFirst({
      where: { email: user.email }
    });

    if (existingUser) {
      throw new Error(`User with email ${user.email} already exists`);
    }

    const created = await prisma.s_USER.create({
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        password_hash: '',
  address: user.address || '',
  phone: user.phone ?? null,
  legal_status: user.legal_status ?? null,
  description: user.description ?? null,
      },
      include: {
        founders: true,
        investors: true,
      },
    });

    return this.mapPrismaToUser(created);
  }

  async getById(id: number): Promise<User | null> {
    const user = await prisma.s_USER.findUnique({
      where: { id },
      include: {
        founders: true,
        investors: true,
      },
    });

    if (!user) return null;
    return this.mapPrismaToUser(user);
  }

  async getAll(): Promise<User[]> {
    const users = await prisma.s_USER.findMany({
      include: {
        founders: true,
        investors: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map(user => this.mapPrismaToUser(user));
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await prisma.s_USER.findFirst({
      where: { email },
      include: {
        founders: true,
        investors: true,
      },
    });

    if (!user) return null;
    return this.mapPrismaToUser(user);
  }

  async getByRole(role: string): Promise<User[]> {
    const users = await prisma.s_USER.findMany({
      where: { role },
      include: {
        founders: true,
        investors: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map(user => this.mapPrismaToUser(user));
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    const users = await prisma.s_USER.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        founders: true,
        investors: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map(user => this.mapPrismaToUser(user));
  }

  async getFounders(): Promise<User[]> {
    const users = await prisma.s_USER.findMany({
      where: {
        founders: {
          some: {},
        },
      },
      include: {
        founders: true,
        investors: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map(user => this.mapPrismaToUser(user));
  }

  async getInvestors(): Promise<User[]> {
    const users = await prisma.s_USER.findMany({
      where: {
        investors: {
          some: {},
        },
      },
      include: {
        founders: true,
        investors: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map(user => this.mapPrismaToUser(user));
  }

  async search(query: string): Promise<User[]> {
    const users = await prisma.s_USER.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { role: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        founders: true,
        investors: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map(user => this.mapPrismaToUser(user));
  }

  async update(id: number, user: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
    try {
      const updated = await prisma.s_USER.update({
        where: { id },
        data: {
          ...(user.name && { name: user.name }),
          ...(user.email && { email: user.email }),
          ...(user.role && { role: user.role }),
          ...(user.address && { address: user.address }),
          ...(user.phone !== undefined && { phone: user.phone }),
          ...(user.legal_status !== undefined && { legal_status: user.legal_status }),
          ...(user.description !== undefined && { description: user.description }),
        },
        include: {
          founders: true,
          investors: true,
        },
      });

      return this.mapPrismaToUser(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.s_USER.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getPaginated(page: number, limit: number): Promise<{ users: User[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      prisma.s_USER.findMany({
        skip,
        take: limit,
        include: {
          founders: true,
          investors: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.s_USER.count(),
    ]);

    return {
      users: users.map(user => this.mapPrismaToUser(user)),
      total,
    };
  }

  async getUserWithPassword(email: string): Promise<User & { password_hash: string } | null> {
    const user = await prisma.s_USER.findFirst({
      where: { email },
      include: {
        founders: true,
        investors: true,
      },
    });

    if (!user) return null;

    const mappedUser = this.mapPrismaToUser(user);
    return {
      ...mappedUser,
      password_hash: user.password_hash,
    };
  }

  async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    try {
      await prisma.s_USER.update({
        where: { id },
        data: { password_hash: passwordHash },
      });
      return true;
    } catch {
      return false;
    }
  }

  async save(user: { id: number; name: string; email: string }): Promise<void> {
    await prisma.s_USER.update({
      where: { id: user.id },
      data: { name: user.name, email: user.email },
    });
  }
}