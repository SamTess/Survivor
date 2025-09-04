import prisma from "./../client";
import { ExternalUserRepository } from "../../../repositories/sync/ExternalUserRepository";
import { UserApiResponse } from "../../../../domain/interfaces/User";

export class ExternalUserRepositoryPrisma implements ExternalUserRepository {
  async upsert(item: UserApiResponse): Promise<void> {
    const user = await prisma.s_USER.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        email: item.email,
        role: item.role,
      },
      create: {
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        password_hash: "",
      },
    });

    if (item.investor_id) {
      try {
        await prisma.s_INVESTOR.update({
          where: { id: item.investor_id },
          data: { user_id: user.id },
        });
  } catch {
      }
    }

    if (item.founder_id) {
      try {
        await prisma.s_FOUNDER.update({
          where: { id: item.founder_id },
            data: { user_id: user.id },
        });
  } catch {
        }
    }
  }

  async saveImage(userId: number, data: Buffer): Promise<void> {
    await prisma.s_USER.update({ where: { id: userId }, data: { image_data: data } });
  }
}
