import prisma from "./../client";
import { ExternalUserRepository } from "../../../repositories/sync/ExternalUserRepository";
import { UserApiResponse } from "../../../../domain/interfaces/User";

export class ExternalUserRepositoryPrisma implements ExternalUserRepository {
  async upsert(item: UserApiResponse): Promise<void> {
    await prisma.s_USER.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        email: item.email,
        role: item.role,
        address: "",
      },
      create: {
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        address: "",
        password_hash: "",
      },
    });
  }

  async saveImage(userId: number, data: Buffer): Promise<void> {
    await prisma.s_USER.update({ where: { id: userId }, data: { image_data: data } });
  }
}
