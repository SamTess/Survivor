export interface StatisticsOverview {
  totalViews: number;
  totalLikes: number;
  totalBookmarks: number;
  totalFollows: number;
  totalActiveUsers: number;
  conversionRate: number;
  totalSessions: number;
  viewsThisMonth: number;
  lastUpdated: string;
}

export interface PlatformMetrics {
  totalStartups: number;
  totalEvents: number;
  totalNews: number;
  totalUsers: number;
}

export interface ChartData {
  monthlyViews: number[];
  activeUsers: number[];
}

export interface ContentStats {
  id: number;
  name?: string;
  title?: string;
  viewsCount: number;
  likesCount: number;
  bookmarksCount: number;
  followersCount?: number;
  startup_id?: number;
}

export interface TopContent {
  startups: ContentStats[];
  events: ContentStats[];
  news: ContentStats[];
}

export interface StatisticsData {
  overview: StatisticsOverview;
  platform?: PlatformMetrics;
  charts: ChartData;
  topContent: TopContent;
}

export interface StatisticsResponse {
  success: boolean;
  data: StatisticsData;
  period: string;
  contentType: string;
  scope: string;
  startupIds?: number[];
  generatedAt: string;
}

export interface StatisticsFilters {
  period: string;
  scope: string;
  contentType: string;
  userId: number;
  startDate?: Date;
}
