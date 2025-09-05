import prisma from "./../client";
import { InvestorRepository } from "../../../repositories/sync/InvestorRepository";
import { InvestorApiResponse } from "../../../../domain/interfaces/Investor";
import { Prisma } from "@prisma/client";

export class InvestorRepositoryPrisma implements InvestorRepository {
  async upsert(item: InvestorApiResponse): Promise<void> {
  await prisma.s_INVESTOR.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        legal_status: item.legal_status ?? "",
        address: item.address ?? "",
        email: item.email,
        phone: item.phone ?? "",
        description: item.description ?? "",
        investor_type: item.investor_type,
        investment_focus: item.investment_focus,
      } as Prisma.S_INVESTORUncheckedUpdateInput,
      create: {
        id: item.id,
        name: item.name,
        legal_status: item.legal_status ?? "",
        address: item.address ?? "",
        email: item.email,
        phone: item.phone ?? "",
        description: item.description ?? "",
        investor_type: item.investor_type,
        investment_focus: item.investment_focus,
      } as Prisma.S_INVESTORUncheckedCreateInput,
    });
  }
}
