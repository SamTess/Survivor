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
  summary?: string;
  source?: string;
  publishedAt?: string;
  category?: string;
  relevanceScore: number;
  url?: string;
  viewsCount?: number;
  likesCount?: number;
  bookmarksCount?: number;
}

interface UpcomingEvent {
  id: number;
  name: string;
  description?: string;
  date?: string;
  location?: string;
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

// Utilities de calcul
function pctChange(prev: number, curr: number): number {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / prev) * 100;
}

export default function MarketInsights({ investor }: MarketInsightsProps) {
  const [insights, setInsights] = useState<MarketInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trends' | 'news' | 'events' | 'sectors'>('trends');
  const focus = investor?.investment_focus?.toLowerCase() || '';

  useEffect(() => {
    const fetchMarketInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const [newsRes, eventsRes, dealsRes] = await Promise.all([
          fetch(`/api/news?page=1&limit=50`),
          fetch(`/api/events?upcoming=true`),
          fetch(`/api/opportunities?status=deal&page=1&limit=10000`),
        ]);

        const newsJson = await newsRes.json();
        const eventsJson = await eventsRes.json();
        const dealsJson = await dealsRes.json();

        if (!newsJson.success || !eventsJson.success || !dealsJson.success) {
          throw new Error('API error');
        }

        type ApiNews = { id: number; title?: string; description?: string; news_date?: string | Date; category?: string; startup?: { name?: string; sector?: string } };
        type ApiEvent = { id: number; name: string; description?: string; dates?: string; location?: string; event_type?: string };
        type ApiDeal = { updated_at: string | Date; proposed_amount_eur?: string | number | null };
        const rawNews = (newsJson.data || []) as ApiNews[];
        const rawEvents = (eventsJson.data || []) as ApiEvent[];
        const rawDeals = (dealsJson.items || []) as ApiDeal[];

        const news: NewsArticle[] = rawNews.slice(0, 12).map((n: ApiNews, idx: number) => {
        const sector = n.startup?.sector || n.category || undefined;
        const title: string = n.title || `News ${idx + 1}`;
        const description: string | undefined = n.description || undefined;
        const publishedAt: string | undefined = n.news_date ? new Date(n.news_date).toISOString() : undefined;
        const relevance = focus && sector ? (sector.toLowerCase().includes(focus) ? 90 : 60) : 65;
        return {
            id: n.id,
            title,
            summary: description,
            source: n.startup?.name || 'Internal',
            publishedAt,
            category: sector,
            relevanceScore: relevance,
            url: undefined,
            viewsCount: undefined,
            likesCount: undefined,
            bookmarksCount: undefined,
          };
        }).sort((a, b) => b.relevanceScore - a.relevanceScore);

        const events: UpcomingEvent[] = rawEvents.slice(0, 8).map((e: ApiEvent) => {
        const et = (e.event_type || '').toLowerCase();
        const eventType: UpcomingEvent['eventType'] = et.includes('webinar') ? 'webinar' : et.includes('pitch') ? 'pitch' : et.includes('conf') ? 'conference' : 'networking';
        const rel = focus ? ((e.name || '').toLowerCase().includes(focus) || (e.description || '').toLowerCase().includes(focus) ? 85 : 60) : 65;
        return {
            id: e.id,
            name: e.name,
            description: e.description || undefined,
            date: e.dates || undefined,
            location: e.location || undefined,
            eventType,
            relevanceScore: rel,
          };
        }).sort((a, b) => b.relevanceScore - a.relevanceScore);

        const now = new Date();
        const days = (d: string | Date) => (typeof d === 'string' ? new Date(d) : d);
        const inWindow = (d: Date, start: Date, end: Date) => d >= start && d < end;
        const qLen = 90 * 24 * 60 * 60 * 1000;
        const endCurr = now;
        const startCurr = new Date(endCurr.getTime() - qLen);
        const endPrev = startCurr;
        const startPrev = new Date(endPrev.getTime() - qLen);

        const dealsCurr = rawDeals.filter((o) => inWindow(days(o.updated_at), startCurr, endCurr));
        const dealsPrev = rawDeals.filter((o) => inWindow(days(o.updated_at), startPrev, endPrev));
        const sumAmount = (arr: ApiDeal[]) => arr.reduce((s, o) => s + (o.proposed_amount_eur ? Number(o.proposed_amount_eur) : 0), 0);
        const avg = (arr: ApiDeal[], getter: (x: ApiDeal[]) => number) => (arr.length ? getter(arr) / arr.length : 0);
        const avgCurr = avg(dealsCurr, sumAmount);
        const avgPrev = avg(dealsPrev, sumAmount);

        const timeframes = getDynamicTimeframes();
        const trends: MarketTrend[] = [
          {
            id: 1,
            title: 'Funding deal activity',
            category: 'funding',
            description: 'Change in number of signed deals vs previous quarter',
            changePercent: pctChange(dealsPrev.length, dealsCurr.length),
            timeframe: timeframes.last3Months,
            relevanceScore: 80,
          },
          {
            id: 2,
            title: 'Average ticket size',
            category: 'valuation',
            description: 'Average proposed amount per deal vs previous quarter',
            changePercent: pctChange(avgPrev, avgCurr),
            timeframe: timeframes.last3Months,
            relevanceScore: 72,
          },
          {
            id: 3,
            title: 'Focus sector mentions',
            category: 'sector',
            description: 'Mentions in news for the investor focus sector vs previous month',
            changePercent: (() => {
              if (!focus) return 0;
              const last30 = new Date(now.getTime() - 30 * 86400000);
              const prev30 = new Date(now.getTime() - 60 * 86400000);
              const nLast = rawNews.filter((n) => {
                const d = n.news_date ? new Date(n.news_date) : null;
                const sec = (n.startup?.sector || n.category || '').toLowerCase();
                return d && d >= last30 && d < now && sec.includes(focus);
              }).length;
              const nPrev = rawNews.filter((n) => {
                const d = n.news_date ? new Date(n.news_date) : null;
                const sec = (n.startup?.sector || n.category || '').toLowerCase();
                return d && d >= prev30 && d < last30 && sec.includes(focus);
              }).length;
              return pctChange(nPrev, nLast);
            })(),
            timeframe: 'Last 30 days',
            relevanceScore: focus ? 85 : 60,
          },
        ];

        // Sector performance (proxi via news récents)
        const newsBySector = new Map<string, { last90: number; prev90: number }>();
        for (const n of rawNews) {
          const sector = (n.startup?.sector || n.category || 'Other') as string;
          const d = n.news_date ? new Date(n.news_date) : undefined;
          const bucket = newsBySector.get(sector) || { last90: 0, prev90: 0 };
          if (d) {
            if (d >= startCurr && d < endCurr) bucket.last90 += 1;
            else if (d >= startPrev && d < endPrev) bucket.prev90 += 1;
          }
          newsBySector.set(sector, bucket);
        }
        const sectorPerformance = Array.from(newsBySector.entries()).map(([sector, v]) => ({
          sector,
          performance: pctChange(v.prev90, v.last90),
          dealCount: v.last90,
          avgValuation: 0,
        })).sort((a, b) => b.performance - a.performance).slice(0, 10);

        setInsights({ trends, news, events, sectorPerformance });
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
      <section className="space-y-6 overflow-y-auto max-w-4xl mx-auto">
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
      <section className="space-y-6 overflow-y-auto max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Market Insights</h2>
          <p className="text-sm text-red-500">Error: {error || 'Failed to load market insights'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 overflow-y-auto max-w-4xl mx-auto">
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
                  {article.summary && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{article.summary}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {article.source && <span>{article.source}</span>}
                    {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
                    {article.category && (
                      <span className="px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-full">
                        {article.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRelevanceColor(article.relevanceScore)}`}>
                    {article.relevanceScore}% relevant
                  </span>
                  {article.url && (
                    <a href={article.url} target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                      <FiExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
              {(article.viewsCount || article.likesCount || article.bookmarksCount) && (
                <div className="flex items-center justify-between pt-3 border-t border-border/20 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {typeof article.viewsCount === 'number' && <span>{article.viewsCount} views</span>}
                    {typeof article.likesCount === 'number' && <span>{article.likesCount} likes</span>}
                    {typeof article.bookmarksCount === 'number' && <span>{article.bookmarksCount} bookmarks</span>}
                  </div>
                </div>
              )}
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
                      <span>{event.date ? formatDate(event.date) : 'TBD'}</span>
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
                    {sector.avgValuation ? (
                      <p className="text-xs text-muted-foreground">Avg: {formatCurrency(sector.avgValuation)}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Avg: N/A</p>
                    )}
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
