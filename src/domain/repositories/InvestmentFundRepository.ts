import { InvestmentFund } from '../interfaces/InvestmentFund';

export interface InvestmentFundRepository {
  getByInvestor(investorId: number): Promise<InvestmentFund[]>;
}
