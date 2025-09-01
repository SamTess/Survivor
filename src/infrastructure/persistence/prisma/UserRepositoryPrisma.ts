import { prisma } from "../prisma/client";
import { UserRepository } from "../../repositories/UserRepository";
import { User } from "../../../domain/entities/User";

export class UserRepositoryPrisma implements UserRepository {
  async getById(id: number): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return { id: row.id, name: row.name, email: row.email };
  }

  async save(user: User): Promise<void> {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: user.name, email: user.email },
    });
  }
}