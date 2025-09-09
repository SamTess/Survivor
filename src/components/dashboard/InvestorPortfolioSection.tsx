"use client";

import React, { useMemo, useState, useEffect } from "react";
import { FiDollarSign, FiTarget, FiPieChart, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { FaBriefcase, FaRocket } from "react-icons/fa";
import { InvestorApiResponse } from "@/domain/interfaces/Investor";

interface PortfolioData {
  overview: {
    totalInvestments: number;
    totalValue: number;
    activeInvestments: number;
    averageReturn: number;
    bestPerformer: string;
    worstPerformer: string;
    totalROI: number;
    monthlyReturn: number;
  };
  investments: Array<{
    id: number;
    startupName: string;
    amount: number;
    currentValue: number;
    returnRate: number;
    sector: string;
    investmentDate: string;
    status: 'active' | 'exited' | 'at_risk';
    maturity: string;
  }>;
  sectorDistribution: Array<{
    sector: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  performance: {
    monthlyReturns: number[];
    benchmarkReturns: number[];
  };
}

interface InvestorPortfolioSectionProps {
  investor: InvestorApiResponse | null;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount);
}

function formatPercent(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 2,
    signDisplay: 'always'
  }).format(n / 100);
}

function Sparkline({ data, color = "#6610F2", height = 36 }: { data: number[]; color?: string; height?: number }) {
  const path = useMemo(() => {
    if (!data.length) return "";
    const w = 120;
    const h = height;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));

    return data
      .map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (data.length - 1)) * w} ${h - norm(v) * h}`)
      .join(" ");
  }, [data, height]);

  return (
    <svg width="120" height={height} className="text-muted-foreground">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Mock data generator - In real app, this would come from API
function generateMockPortfolioData(): PortfolioData {
  const sectors = ['FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'E-commerce', 'AI/ML', 'SaaS'];
  const maturities = ['Seed', 'Series A', 'Series B', 'Growth'];
  const statuses: ('active' | 'exited' | 'at_risk')[] = ['active', 'active', 'active', 'exited', 'at_risk'];

  const investments = Array.from({ length: 12 }, (_, i) => {
    const amount = 50000 + Math.random() * 500000;
    const returnRate = -20 + Math.random() * 100; // -20% to +80%
    const currentValue = amount * (1 + returnRate / 100);

    return {
      id: i + 1,
      startupName: `Startup ${String.fromCharCode(65 + i)}`,
      amount,
      currentValue,
      returnRate,
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      investmentDate: new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      maturity: maturities[Math.floor(Math.random() * maturities.length)]
    };
  });

  const totalInvestments = investments.length;
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalROI = ((totalValue - totalInvested) / totalInvested) * 100;
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;

  // Sector distribution
  const sectorMap = new Map<string, { amount: number; count: number }>();
  investments.forEach(inv => {
    const existing = sectorMap.get(inv.sector) || { amount: 0, count: 0 };
    sectorMap.set(inv.sector, {
      amount: existing.amount + inv.amount,
      count: existing.count + 1
    });
  });

  const sectorDistribution = Array.from(sectorMap.entries()).map(([sector, data]) => ({
    sector,
    amount: data.amount,
    percentage: (data.amount / totalInvested) * 100,
    count: data.count
  })).sort((a, b) => b.amount - a.amount);

  const monthlyReturns = Array.from({ length: 12 }, () => -5 + Math.random() * 15);
  const benchmarkReturns = Array.from({ length: 12 }, () => -3 + Math.random() * 10);

  return {
    overview: {
      totalInvestments,
      totalValue,
      activeInvestments,
      averageReturn: totalROI / totalInvestments,
      bestPerformer: investments.sort((a, b) => b.returnRate - a.returnRate)[0]?.startupName || 'N/A',
      worstPerformer: investments.sort((a, b) => a.returnRate - b.returnRate)[0]?.startupName || 'N/A',
      totalROI,
      monthlyReturn: monthlyReturns[monthlyReturns.length - 1]
    },
    investments,
    sectorDistribution,
    performance: {
      monthlyReturns,
      benchmarkReturns
    }
  };
}

export default function InvestorPortfolioSection({ investor }: InvestorPortfolioSectionProps) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3M' | '6M' | '1Y' | 'ALL'>('1Y');

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      setError(null);

      try {
        // For now, use mock data. In production, this would be an API call:
        // const response = await apiService.get<PortfolioData>(`/investors/${investor?.id}/portfolio`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData = generateMockPortfolioData();
        setPortfolioData(mockData);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setError('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [investor]);

  if (loading) {
    return (
      <section className="space-y-6 overflow-y-auto">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !portfolioData) {
    return (
      <section className="space-y-6 overflow-y-auto">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Portfolio Overview</h2>
          <p className="text-sm text-red-500">Error: {error || 'Failed to load portfolio data'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm animate-card transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Portfolio Overview</h2>
            <p className="text-sm text-muted-foreground">
              Track your investments and portfolio performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Timeframe:</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as '3M' | '6M' | '1Y' | 'ALL')}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            >
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
              <option value="ALL">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(portfolioData.overview.totalValue)}</p>
            </div>
            <FiDollarSign className="text-green-500" size={24} />
          </div>
          <div className="mt-2">
            <Sparkline data={portfolioData.performance.monthlyReturns} color="#10b981" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercent(portfolioData.overview.monthlyReturn)} this month
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total ROI</p>
              <p className={`text-2xl font-semibold ${portfolioData.overview.totalROI >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(portfolioData.overview.totalROI)}
              </p>
            </div>
            {portfolioData.overview.totalROI >= 0 ? (
              <FiArrowUp className="text-green-500" size={24} />
            ) : (
              <FiArrowDown className="text-red-500" size={24} />
            )}
          </div>
          <div className="mt-2">
            <Sparkline data={portfolioData.performance.benchmarkReturns} color={portfolioData.overview.totalROI >= 0 ? "#10b981" : "#ef4444"} />
            <p className="text-xs text-muted-foreground mt-1">vs market benchmark</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Investments</p>
              <p className="text-2xl font-semibold text-foreground">{portfolioData.overview.activeInvestments}</p>
            </div>
            <FaBriefcase className="text-blue-500" size={24} />
          </div>
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">
              out of {portfolioData.overview.totalInvestments} total
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Return</p>
              <p className={`text-2xl font-semibold ${portfolioData.overview.averageReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(portfolioData.overview.averageReturn)}
              </p>
            </div>
            <FiTarget className="text-purple-500" size={24} />
          </div>
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">per investment</p>
          </div>
        </div>
      </div>

      {/* Detailed sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Investments */}
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Recent Investments</h3>
            <button className="text-xs text-primary hover:text-primary/80 transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {portfolioData.investments.slice(0, 5).map((investment) => (
              <div key={investment.id} className="flex justify-between items-center py-2 border-b border-border/10 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FaRocket className="text-primary" size={14} />
                    <p className="text-sm font-medium text-foreground truncate">{investment.startupName}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      investment.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      investment.status === 'exited' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {investment.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {investment.sector} • {investment.maturity} • {formatCurrency(investment.amount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${investment.returnRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(investment.returnRate)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(investment.currentValue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Sector Distribution</h3>
            <FiPieChart className="text-muted-foreground" size={16} />
          </div>
          <div className="space-y-3">
            {portfolioData.sectorDistribution.slice(0, 6).map((sector, index) => (
              <div key={sector.sector} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: `hsl(${(index * 360) / portfolioData.sectorDistribution.length}, 70%, 50%)` }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{sector.sector}</p>
                    <p className="text-xs text-muted-foreground">{sector.count} investments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{sector.percentage.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(sector.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Performance Trend</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-primary"></div>
              <span className="text-muted-foreground">Portfolio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-muted-foreground"></div>
              <span className="text-muted-foreground">Benchmark</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <Sparkline data={portfolioData.performance.monthlyReturns} color="#6610F2" height={60} />
            <p className="text-xs text-muted-foreground">12-month performance comparison</p>
          </div>
        </div>
      </div>
    </section>
  );
}
