export type PortfolioOverview = {
  totalInvestments: number;
  totalValue: number;
  activeInvestments: number;
  averageReturn: number;
  bestPerformer: string;
  worstPerformer: string;
  totalROI: number;
  monthlyReturn: number;
};

export type PortfolioInvestmentItem = {
  id: string;
  startupId: number;
  startupName: string;
  amount: number;
  currentValue: number;
  returnRate: number;
  sector: string;
  investmentDate: string;
  status: 'active' | 'exited' | 'at_risk';
  maturity: string;
};

export type PortfolioData = {
  overview: PortfolioOverview;
  investments: PortfolioInvestmentItem[];
  sectorDistribution: Array<{ sector: string; amount: number; percentage: number; count: number; }>;
  performance: { monthlyReturns: number[]; benchmarkReturns: number[] };
};
