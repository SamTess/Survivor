"use client";

import React, { useState, useEffect } from "react";
import { FiTrendingUp, FiTrendingDown, FiCalendar, FiExternalLink, FiUsers, FiMapPin } from "react-icons/fi";
import { FaNewspaper, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { InvestorApiResponse } from "@/domain/interfaces/Investor";

interface MarketTrend {
  id: number;
  title: string;
  category: 'sector' | 'funding' | 'valuation' | 'exits';
  description: string;
  changePercent: number;
  timeframe: string;
  relevanceScore: number;
}

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: string;
  relevanceScore: number;
  url?: string;
  viewsCount: number;
  likesCount: number;
  bookmarksCount: number;
}

interface UpcomingEvent {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  eventType: 'conference' | 'pitch' | 'networking' | 'webinar';
  relevanceScore: number;
  attendeeCount?: number;
  registrationUrl?: string;
}

interface MarketInsight {
  trends: MarketTrend[];
  news: NewsArticle[];
  events: UpcomingEvent[];
  sectorPerformance: Array<{
    sector: string;
    performance: number;
    dealCount: number;
    avgValuation: number;
  }>;
}

interface MarketInsightsProps {
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

function formatPercent(n: number, showSign = true) {
  return new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: showSign ? 'always' : 'auto'
  }).format(n / 100);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getRelevanceColor(score: number) {
  if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
  if (score >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
  if (score >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
  return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
}

function getEventTypeIcon(type: string) {
  switch (type) {
    case 'conference': return '🎤';
    case 'pitch': return '🚀';
    case 'networking': return '🤝';
    case 'webinar': return '💻';
    default: return '📅';
  }
}

// Helper function to get current quarter and year
function getCurrentQuarter(): string {
  const now = new Date();
  const quarter = Math.floor((now.getMonth() + 3) / 3);
  const year = now.getFullYear();
  return `Q${quarter} ${year}`;
}

// Helper function to get dynamic timeframes
function getDynamicTimeframes() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = getCurrentQuarter();
  
  return {
    currentQuarter,
    last3Months: 'Last 3 months',
    ytd: `YTD ${currentYear}`,
    previousQuarter: `Q${Math.floor((now.getMonth() + 3) / 3) - 1 || 4} ${Math.floor((now.getMonth() + 3) / 3) - 1 ? currentYear : currentYear - 1}`
  };
}

// Mock data generator
function generateMockMarketInsights(investor: InvestorApiResponse | null): MarketInsight {
  const sectors = ['FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'E-commerce', 'AI/ML', 'SaaS'];
  const focusSector = investor?.investment_focus || 'FinTech';
  const timeframes = getDynamicTimeframes();

  const trends: MarketTrend[] = [
    {
      id: 1,
      title: `${focusSector} Sector Sees 25% Growth`,
      category: 'sector',
      description: `Investment in ${focusSector} startups has increased significantly this quarter, driven by innovation and market demand.`,
      changePercent: 25.3,
      timeframe: timeframes.currentQuarter,
      relevanceScore: 95
    },
    {
      id: 2,
      title: 'Series A Funding Rounds Up 15%',
      category: 'funding',
      description: 'Early-stage funding shows strong growth with more investors entering the market.',
      changePercent: 15.7,
      timeframe: timeframes.last3Months,
      relevanceScore: 78
    },
    {
      id: 3,
      title: 'Tech Startup Valuations Stabilizing',
      category: 'valuation',
      description: 'After a period of correction, startup valuations are finding more realistic levels.',
      changePercent: -5.2,
      timeframe: timeframes.ytd,
      relevanceScore: 82
    },
    {
      id: 4,
      title: 'Exit Activity Rebounds',
      category: 'exits',
      description: 'M&A activity and IPO filings show increased confidence in the market.',
      changePercent: 32.1,
      timeframe: timeframes.currentQuarter,
      relevanceScore: 71
    }
  ];

  const news: NewsArticle[] = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `Breaking: ${sectors[i % sectors.length]} Startup Raises €${(10 + Math.random() * 90).toFixed(0)}M`,
    summary: `Revolutionary ${sectors[i % sectors.length].toLowerCase()} solution secures major funding round led by prominent investors, marking significant milestone in industry growth.`,
    source: ['TechCrunch', 'Venture Beat', 'EU Startups', 'Sifted'][i % 4],
    publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: sectors[i % sectors.length],
    relevanceScore: focusSector === sectors[i % sectors.length] ? 85 + Math.random() * 15 : 40 + Math.random() * 40,
    viewsCount: Math.floor(Math.random() * 5000) + 100,
    likesCount: Math.floor(Math.random() * 200) + 10,
    bookmarksCount: Math.floor(Math.random() * 50) + 5
  })).sort((a, b) => b.relevanceScore - a.relevanceScore);

  const eventTypes: ('conference' | 'pitch' | 'networking' | 'webinar')[] = ['conference', 'pitch', 'networking', 'webinar'];
  const events: UpcomingEvent[] = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `${sectors[i % sectors.length]} Summit 2024`,
    description: `Leading ${sectors[i % sectors.length].toLowerCase()} conference bringing together investors, founders, and industry experts.`,
    date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: ['Paris', 'London', 'Berlin', 'Amsterdam', 'Barcelona', 'Stockholm'][i % 6],
    eventType: eventTypes[i % eventTypes.length],
    relevanceScore: focusSector === sectors[i % sectors.length] ? 85 + Math.random() * 15 : 50 + Math.random() * 30,
    attendeeCount: Math.floor(Math.random() * 1000) + 100
  })).sort((a, b) => b.relevanceScore - a.relevanceScore);

  const sectorPerformance = sectors.map(sector => ({
    sector,
    performance: -10 + Math.random() * 30,
    dealCount: Math.floor(Math.random() * 50) + 10,
    avgValuation: 5000000 + Math.random() * 20000000
  })).sort((a, b) => b.performance - a.performance);

  return {
    trends,
    news,
    events,
    sectorPerformance
  };
}

export default function MarketInsights({ investor }: MarketInsightsProps) {
  const [insights, setInsights] = useState<MarketInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trends' | 'news' | 'events' | 'sectors'>('trends');

  useEffect(() => {
    const fetchMarketInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        // For now, use mock data. In production:
        // const response = await apiService.get<MarketInsight>(`/market-insights?investor_id=${investor?.id}`);

        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData = generateMockMarketInsights(investor);
        setInsights(mockData);
      } catch (error) {
        console.error('Error fetching market insights:', error);
        setError('Failed to load market insights');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketInsights();
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
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !insights) {
    return (
      <section className="space-y-6 overflow-y-auto">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Market Insights</h2>
          <p className="text-sm text-red-500">Error: {error || 'Failed to load market insights'}</p>
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
            <h2 className="text-lg font-semibold text-foreground">Market Insights</h2>
            <p className="text-sm text-muted-foreground">
              Stay informed about market trends and opportunities
            </p>
          </div>
          {investor?.investment_focus && (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              Focused on {investor.investment_focus}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 p-1 bg-secondary/30 rounded-lg">
          {[
            { key: 'trends' as const, label: 'Trends', icon: FiTrendingUp },
            { key: 'news' as const, label: 'News', icon: FaNewspaper },
            { key: 'events' as const, label: 'Events', icon: FaCalendarAlt },
            { key: 'sectors' as const, label: 'Sectors', icon: FaChartLine }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          {insights.trends.map(trend => (
            <div key={trend.id} className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{trend.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRelevanceColor(trend.relevanceScore)}`}>
                      {trend.relevanceScore}% relevant
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{trend.description}</p>
                  <p className="text-xs text-muted-foreground">{trend.timeframe}</p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  {trend.changePercent >= 0 ? (
                    <FiTrendingUp className="text-green-500" size={20} />
                  ) : (
                    <FiTrendingDown className="text-red-500" size={20} />
                  )}
                  <span className={`text-lg font-bold ${trend.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(trend.changePercent)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/20">
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                  trend.category === 'sector' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                  trend.category === 'funding' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  trend.category === 'valuation' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                  'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                }`}>
                  {trend.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'news' && (
        <div className="space-y-4">
          {insights.news.map(article => (
            <div key={article.id} className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaNewspaper className="text-primary" size={16} />
                    <h3 className="font-semibold text-foreground line-clamp-2">{article.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{article.summary}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{article.source}</span>
                    <span>{formatDate(article.publishedAt)}</span>
                    <span className="px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRelevanceColor(article.relevanceScore)}`}>
                    {article.relevanceScore}% relevant
                  </span>
                  <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    <FiExternalLink size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/20 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>{article.viewsCount} views</span>
                  <span>{article.likesCount} likes</span>
                  <span>{article.bookmarksCount} bookmarks</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          {insights.events.map(event => (
            <div key={event.id} className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getEventTypeIcon(event.eventType)}</span>
                    <h3 className="font-semibold text-foreground">{event.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRelevanceColor(event.relevanceScore)}`}>
                      {event.relevanceScore}% relevant
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FiCalendar size={14} />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FiMapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                    {event.attendeeCount && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <FiUsers size={14} />
                        <span>{event.attendeeCount} attendees</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/20">
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                  event.eventType === 'conference' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                  event.eventType === 'pitch' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  event.eventType === 'networking' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                  'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                }`}>
                  {event.eventType}
                </span>
                <button className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sectors' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
            <h3 className="font-semibold text-foreground mb-4">Sector Performance Overview</h3>
            <div className="space-y-3">
              {insights.sectorPerformance.map((sector, index) => (
                <div key={sector.sector} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{sector.sector}</p>
                      <p className="text-xs text-muted-foreground">{sector.dealCount} deals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {sector.performance >= 0 ? (
                        <FiTrendingUp className="text-green-500" size={16} />
                      ) : (
                        <FiTrendingDown className="text-red-500" size={16} />
                      )}
                      <span className={`font-semibold ${sector.performance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(sector.performance)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg: {formatCurrency(sector.avgValuation)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
