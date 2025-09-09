import {
  StatisticsData,
  StatisticsFilters,
  ContentStats,
  PlatformMetrics
} from '../interfaces/Statistics';

export interface StatisticsRepository {
  getStartupIds(userId: number, isAdmin: boolean): Promise<number[]>;
  getNewsIds(startupIds: number[]): Promise<number[]>;
  getEventIds(): Promise<number[]>;
  isUserAdmin(userId: number): Promise<boolean>;

  getTotalLikes(filters: StatisticsFilters, targetIds: number[]): Promise<number>;
  getTotalBookmarks(filters: StatisticsFilters, targetIds: number[]): Promise<number>;
  getTotalFollows(filters: StatisticsFilters, startupIds: number[]): Promise<number>;

  getStartupStats(startupIds: number[]): Promise<ContentStats[]>;
  getNewsStats(newsIds: number[]): Promise<ContentStats[]>;
  getEventStats(eventIds: number[]): Promise<ContentStats[]>;

  getInteractionEvents(filters: StatisticsFilters, targetIds: number[]): Promise<{
    occurredAt: Date;
    eventType: string;
  }[]>;

  getPlatformMetrics(): Promise<PlatformMetrics>;
  getUserPlatformMetrics(startupIds: number[], newsCount: number): Promise<PlatformMetrics>;
}
