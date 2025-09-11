import { PortfolioRepository } from "../../../domain/repositories/PortfolioRepository";
import { PortfolioData } from "../../../domain/interfaces/Portfolio";

export class PortfolioService {
  constructor(private portfolioRepo: PortfolioRepository) {}

  async getInvestorPortfolio(investorId: number, months?: number): Promise<PortfolioData> {
    return this.portfolioRepo.getForInvestor(investorId, months);
  }
}
