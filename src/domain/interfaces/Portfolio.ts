export type PortfolioOverview = {
  totalInvestments: number;
  totalValue: number; // EUR
  activeInvestments: number;
  averageReturn: number; // percent
  bestPerformer: string;
  worstPerformer: string;
  totalROI: number; // percent
  monthlyReturn: number; // percent (last period)
};

export type PortfolioInvestmentItem = {
  id: string;
  startupId: number;
  startupName: string;
  amount: number; // invested EUR
  currentValue: number; // current value EUR
  returnRate: number; // percent
  sector: string;
  investmentDate: string; // ISO
  status: 'active' | 'exited' | 'at_risk';
  maturity: string;
};

export type PortfolioData = {
  overview: PortfolioOverview;
  investments: PortfolioInvestmentItem[];
  sectorDistribution: Array<{ sector: string; amount: number; percentage: number; count: number; }>;
  performance: { monthlyReturns: number[]; benchmarkReturns: number[] };
};
