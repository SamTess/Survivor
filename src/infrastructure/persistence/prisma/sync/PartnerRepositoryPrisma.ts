import prisma from "../client";
import { PartnerRepository } from "../../../repositories/sync/PartnerRepository";
import { PartnerApiResponse } from "../../../../domain/interfaces/Partner";
import { Prisma } from "@prisma/client";

export class PartnerRepositoryPrisma implements PartnerRepository {
  async upsert(item: PartnerApiResponse): Promise<void> {
    await prisma.s_USER.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        email: item.email,
        role: "partner",
      },
      create: {
        id: item.id,
        name: item.name,
        email: item.email,
        role: "partner",
        password_hash: "",
      },
    });
    await prisma.s_PARTNER.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        legal_status: item.legal_status ?? "",
        address: item.address ?? "",
        email: item.email,
        phone: item.phone ?? "",
        description: item.description ?? "",
        partnership_type: item.partnership_type,
        user_id: item.id,
      } as Prisma.S_PARTNERUncheckedUpdateInput,
      create: {
        id: item.id,
        name: item.name,
        legal_status: item.legal_status ?? "",
        address: item.address ?? "",
        email: item.email,
        phone: item.phone ?? "",
        description: item.description ?? "",
        partnership_type: item.partnership_type,
        user_id: item.id,
      } as Prisma.S_PARTNERUncheckedCreateInput,
    });
  }
}
