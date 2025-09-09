"use client";

import React, { useState, useEffect } from "react";
import { FiSearch, FiMapPin, FiUsers, FiEye, FiHeart, FiBookmark } from "react-icons/fi";
import { FaRocket, FaStar } from "react-icons/fa";
import { InvestorApiResponse } from "@/domain/interfaces/Investor";

interface StartupOpportunity {
  id: number;
  name: string;
  description: string;
  sector: string;
  maturity: string;
  location: string;
  foundingDate: string;
  fundingGoal: number;
  fundingRaised: number;
  valuation: number;
  minimumInvestment: number;
  riskLevel: 'low' | 'medium' | 'high';
  investorCount: number;
  viewsCount: number;
  likesCount: number;
  bookmarksCount: number;
  founderNames: string[];
  tags: string[];
  pitchVideoUrl?: string;
  businessPlan?: string;
  matchScore: number; // How well it matches investor's focus
}

interface InvestmentOpportunitiesProps {
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

function getRiskColor(risk: 'low' | 'medium' | 'high') {
  switch (risk) {
    case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
  }
}

function getMatchScoreColor(score: number) {
  if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
  if (score >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
  if (score >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
  return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
}

// Mock data generator
function generateMockOpportunities(investor: InvestorApiResponse | null): StartupOpportunity[] {
  const sectors = ['FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'E-commerce', 'AI/ML', 'SaaS', 'IoT', 'Blockchain', 'AgTech'];
  const maturities = ['Seed', 'Pre-Series A', 'Series A', 'Series B'];
  const locations = ['Paris', 'London', 'Berlin', 'Amsterdam', 'Barcelona', 'Milan', 'Stockholm', 'Dublin'];
  const riskLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  return Array.from({ length: 20 }, (_, i) => {
    const fundingGoal = 500000 + Math.random() * 5000000;
    const fundingRaised = Math.random() * fundingGoal * 0.8;
    const sector = sectors[Math.floor(Math.random() * sectors.length)];

    // Higher match score if sector matches investor focus
    let matchScore = 30 + Math.random() * 40;
    if (investor?.investment_focus && sector.toLowerCase().includes(investor.investment_focus.toLowerCase())) {
      matchScore = 70 + Math.random() * 30;
    }

    return {
      id: i + 1,
      name: `${sector} Startup ${String.fromCharCode(65 + i)}`,
      description: `Innovative ${sector.toLowerCase()} solution revolutionizing the industry with cutting-edge technology and sustainable business practices.`,
      sector,
      maturity: maturities[Math.floor(Math.random() * maturities.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      foundingDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1).toISOString(),
      fundingGoal,
      fundingRaised,
      valuation: fundingGoal * (2 + Math.random() * 8),
      minimumInvestment: 10000 + Math.random() * 90000,
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      investorCount: Math.floor(Math.random() * 50) + 5,
      viewsCount: Math.floor(Math.random() * 10000) + 100,
      likesCount: Math.floor(Math.random() * 500) + 10,
      bookmarksCount: Math.floor(Math.random() * 100) + 5,
      founderNames: [`Founder ${i + 1}A`, `Founder ${i + 1}B`],
      tags: [sector, maturities[Math.floor(Math.random() * maturities.length)], 'Growth', 'Innovation'].slice(0, 3),
      matchScore: Math.round(matchScore)
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export default function InvestmentOpportunities({ investor }: InvestmentOpportunitiesProps) {
  const [opportunities, setOpportunities] = useState<StartupOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedMaturity, setSelectedMaturity] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      setError(null);

      try {
        // For now, use mock data. In production:
        // const response = await apiService.get<StartupOpportunity[]>(`/investment-opportunities?investor_id=${investor?.id}`);

        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData = generateMockOpportunities(investor);
        setOpportunities(mockData);
      } catch (error) {
        console.error('Error fetching investment opportunities:', error);
        setError('Failed to load investment opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [investor]);

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.sector.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector = selectedSector === 'all' || opportunity.sector === selectedSector;
    const matchesMaturity = selectedMaturity === 'all' || opportunity.maturity === selectedMaturity;
    const matchesRisk = selectedRisk === 'all' || opportunity.riskLevel === selectedRisk;

    return matchesSearch && matchesSector && matchesMaturity && matchesRisk;
  });

  const sectors = [...new Set(opportunities.map(op => op.sector))];
  const maturities = [...new Set(opportunities.map(op => op.maturity))];

  if (loading) {
    return (
      <section className="space-y-6 overflow-y-auto">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6 overflow-y-auto">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Investment Opportunities</h2>
          <p className="text-sm text-red-500">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 overflow-y-auto">
      {/* Header & Filters */}
      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm animate-card transition-all duration-300">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Investment Opportunities</h2>
              <p className="text-sm text-muted-foreground">
                Discover startups that match your investment focus
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <div className="w-4 h-4 flex flex-col gap-1">
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="all">All Sectors</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>

              <select
                value={selectedMaturity}
                onChange={(e) => setSelectedMaturity(e.target.value)}
                className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="all">All Stages</option>
                {maturities.map(maturity => (
                  <option key={maturity} value={maturity}>{maturity}</option>
                ))}
              </select>

              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredOpportunities.length} opportunities found</span>
            {investor?.investment_focus && (
              <span>Matched to your focus: <strong>{investor.investment_focus}</strong></span>
            )}
          </div>
        </div>
      </div>

      {/* Opportunities Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
        {filteredOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaRocket className="text-primary" size={16} />
                <h3 className="font-semibold text-foreground">{opportunity.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-500" size={12} />
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getMatchScoreColor(opportunity.matchScore)}`}>
                  {opportunity.matchScore}% match
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {opportunity.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                {opportunity.sector}
              </span>
              <span className="px-2 py-1 text-xs bg-secondary/50 text-secondary-foreground rounded-full">
                {opportunity.maturity}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(opportunity.riskLevel)}`}>
                {opportunity.riskLevel} risk
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div>
                <p className="text-muted-foreground">Target Funding</p>
                <p className="font-semibold text-foreground">{formatCurrency(opportunity.fundingGoal)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Min. Investment</p>
                <p className="font-semibold text-foreground">{formatCurrency(opportunity.minimumInvestment)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valuation</p>
                <p className="font-semibold text-foreground">{formatCurrency(opportunity.valuation)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary/30 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(opportunity.fundingRaised / opportunity.fundingGoal) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((opportunity.fundingRaised / opportunity.fundingGoal) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/20">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FiMapPin size={12} />
                  <span>{opportunity.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiUsers size={12} />
                  <span>{opportunity.investorCount} investors</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FiEye size={12} />
                  <span>{opportunity.viewsCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiHeart size={12} />
                  <span>{opportunity.likesCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiBookmark size={12} />
                  <span>{opportunity.bookmarksCount}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                View Details
              </button>
              <button className="px-4 py-2 border border-border rounded-lg hover:bg-secondary/50 transition-colors text-sm">
                <FiBookmark size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-8 text-center shadow-sm">
          <FiSearch className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold text-foreground mb-2">No opportunities found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
        </div>
      )}
    </section>
  );
}
