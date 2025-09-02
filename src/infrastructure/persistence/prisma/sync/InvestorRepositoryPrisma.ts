import prisma from "./../client";
import { InvestorRepository } from "../../../repositories/sync/InvestorRepository";
import { InvestorApiResponse } from "../../../../domain/interfaces/Investor";

export class InvestorRepositoryPrisma implements InvestorRepository {
  async upsert(item: InvestorApiResponse): Promise<void> {
    await prisma.s_USER.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        email: item.email,
        role: "INVESTOR",
        address: "",
      },
      create: {
        id: item.id,
        name: item.name,
        email: item.email,
        role: "INVESTOR",
        address: "",
        password_hash: "",
      },
    });
    await prisma.s_INVESTOR.upsert({
      where: { id: item.id },
      update: {
        investor_type: item.investor_type,
        investment_focus: item.investment_focus,
        user_id: item.id,
      },
      create: {
        id: item.id,
        investor_type: item.investor_type,
        investment_focus: item.investment_focus,
        user_id: item.id,
      },
    });
  }
}
