"use client";

import { useMemo, useState, useEffect } from "react";
import { FiTrendingUp, FiUsers, FiBarChart2, FiHeart, FiBookmark, FiEye } from "react-icons/fi";

interface StatsData {
  overview: {
    totalViews: number;
    totalLikes: number;
    totalBookmarks: number;
    totalFollows: number;
    totalActiveUsers: number;
    conversionRate: number;
    totalSessions: number;
    viewsThisMonth: number;
    lastUpdated: string;
  };
  platform?: {
    totalStartups: number;
    totalEvents: number;
    totalNews: number;
    totalUsers: number;
  };
  charts: {
    monthlyViews: number[];
    activeUsers: number[];
  };
  topContent: {
    startups: Array<{
      id: number;
      name: string;
      viewsCount: number;
      likesCount: number;
      bookmarksCount: number;
      followersCount: number;
    }>;
    events: Array<{
      id: number;
      name: string;
      viewsCount: number;
      likesCount: number;
      bookmarksCount: number;
    }>;
    news: Array<{
      id: number;
      title: string;
      viewsCount: number;
      likesCount: number;
      bookmarksCount: number;
    }>;
  };
}

interface StatsSectionProps {
  scope?: 'user' | 'admin';
}

function formatNumber(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

function formatPercent(n: number) {
  return new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }).format(n);
}

function Sparkline({ data, color = "#6610F2" }: { data: number[]; color?: string }) {
  const path = useMemo(() => {
    if (!data.length) return "";
    const w = 120;
    const h = 36;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - norm(v) * h;
      return `${x},${y}`;
    });
    return `M ${points[0]} L ${points.slice(1).join(" ")}`;
  }, [data]);

  return (
    <svg viewBox="0 0 120 36" className="w-28 h-9 overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth={2} className="animate-draw" />
    </svg>
  );
}

function Bars({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const max = Math.max(1, ...data);
  return (
  <div className="flex items-end gap-1 h-24">
      {data.map((v, i) => (
        <div
          key={i}
      className="w-4 rounded-t animate-bar"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.8 }}
          title={`${v}`}
        />
      ))}
    </div>
  );
}

export default function StatsSection({ scope = 'user' }: StatsSectionProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stats?scope=${scope}&period=30`);

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch statistics');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [scope]);

  if (loading) {
    return (
      <section className="space-y-6 overflow-y-auto">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Statistics</h2>
          <p className="text-sm text-muted-foreground">Loading your statistics...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !stats) {
    return (
      <section className="space-y-6 overflow-y-auto">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Statistics</h2>
          <p className="text-sm text-red-500">Error: {error || 'Failed to load statistics'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 overflow-y-auto">
      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm animate-card transition-all duration-300">
        <h2 className="text-lg font-semibold text-foreground">Statistics</h2>
        <p className="text-sm text-muted-foreground">
          {scope === 'admin' ? 'Platform-wide statistics' : 'Statistics for your startups'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-semibold text-foreground">{formatNumber(stats.overview.totalViews)}</p>
            </div>
            <FiEye className="text-blue-500" size={24} />
          </div>
          <div className="mt-2"><Sparkline data={stats.charts.monthlyViews} color="#3b82f6" /></div>
        </div>

        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Likes</p>
              <p className="text-2xl font-semibold text-foreground">{formatNumber(stats.overview.totalLikes)}</p>
            </div>
            <FiHeart className="text-red-500" size={24} />
          </div>
          <div className="mt-2">
            <Bars data={stats.charts.activeUsers.slice(-7)} color="#ef4444" />
            <p className="mt-1 text-xs text-muted-foreground">Last 7 days</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookmarks</p>
              <p className="text-2xl font-semibold text-foreground">{formatNumber(stats.overview.totalBookmarks)}</p>
            </div>
            <FiBookmark className="text-yellow-500" size={24} />
          </div>
          <div className="mt-2"><Sparkline data={stats.charts.activeUsers} color="#eab308" /></div>
        </div>

        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-semibold text-foreground">{formatPercent(stats.overview.conversionRate)}</p>
            </div>
            <FiTrendingUp className="text-primary" size={24} />
          </div>
          <div className="mt-2"><Bars data={stats.charts.monthlyViews.slice(-7)} color="#6610F2" /></div>
        </div>
      </div>

      {/* Top Content Section */}
      {stats.topContent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Startups */}
          {stats.topContent.startups.length > 0 && (
            <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
              <h3 className="text-sm font-medium text-foreground mb-3">Top Performing Startups</h3>
              <div className="space-y-2">
                {stats.topContent.startups.slice(0, 5).map((startup) => (
                  <div key={startup.id} className="flex justify-between items-center py-2 border-b border-border/10 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{startup.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(startup.viewsCount)} views • {formatNumber(startup.likesCount)} likes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{formatNumber(startup.followersCount)}</p>
                      <p className="text-xs text-muted-foreground">followers</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top News */}
          {stats.topContent.news.length > 0 && (
            <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
              <h3 className="text-sm font-medium text-foreground mb-3">Top News Articles</h3>
              <div className="space-y-2">
                {stats.topContent.news.slice(0, 5).map((news) => (
                  <div key={news.id} className="py-2 border-b border-border/10 last:border-0">
                    <p className="text-sm font-medium text-foreground truncate">{news.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(news.viewsCount)} views • {formatNumber(news.likesCount)} likes • {formatNumber(news.bookmarksCount)} bookmarks
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Events (Admin only) */}
          {scope === 'admin' && stats.topContent.events.length > 0 && (
            <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
              <h3 className="text-sm font-medium text-foreground mb-3">Top Events</h3>
              <div className="space-y-2">
                {stats.topContent.events.slice(0, 5).map((event) => (
                  <div key={event.id} className="py-2 border-b border-border/10 last:border-0">
                    <p className="text-sm font-medium text-foreground truncate">{event.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(event.viewsCount)} views • {formatNumber(event.likesCount)} likes • {formatNumber(event.bookmarksCount)} bookmarks
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Platform Overview (Admin only) */}
      {scope === 'admin' && stats.platform && (
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
          <h3 className="text-sm font-medium text-foreground mb-3">Platform Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatNumber(stats.platform.totalStartups)}</p>
              <p className="text-xs text-muted-foreground">Startups</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{formatNumber(stats.platform.totalEvents)}</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{formatNumber(stats.platform.totalNews)}</p>
              <p className="text-xs text-muted-foreground">News Articles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{formatNumber(stats.platform.totalUsers)}</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
