import { PortfolioData } from "../interfaces/Portfolio";

export interface PortfolioRepository {
  getForInvestor(investorId: number, months?: number): Promise<PortfolioData>;
}
