import prisma from "./client";
import { PartnerRepository } from "../../repositories/PartnerRepository";
import { PartnerApiResponse } from "../../../domain/interfaces/Partner";

export class PartnerRepositoryPrisma implements PartnerRepository {
  async upsert(item: PartnerApiResponse): Promise<void> {
    await prisma.s_USER.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        email: item.email,
        role: "PARTNER",
        address: "",
      },
      create: {
        id: item.id,
        name: item.name,
        email: item.email,
        role: "PARTNER",
        address: "",
        password_hash: "",
      },
    });
    await prisma.s_PARTNER.upsert({
      where: { id: item.id },
      update: {
        partnership_type: item.partnership_type,
        user_id: item.id,
      },
      create: {
        id: item.id,
        partnership_type: item.partnership_type,
        user_id: item.id,
      },
    });
  }
}
