import { StatisticsRepository } from '../../../domain/repositories/StatisticsRepository';
import {
  StatisticsData,
  StatisticsFilters,
  ContentStats,
  StatisticsOverview,
  ChartData,
  TopContent
} from '../../../domain/interfaces/Statistics';

interface InteractionEvent {
  occurredAt: Date;
  eventType: string;
}

export class StatisticsService {
  constructor(private readonly statisticsRepository: StatisticsRepository) {}

  async getStatistics(filters: StatisticsFilters): Promise<StatisticsData> {
    const isAdmin = filters.scope === 'admin' ? await this.statisticsRepository.isUserAdmin(filters.userId) : false;

    if (filters.scope === 'admin' && !isAdmin) {
      throw new Error('Admin access required');
    }

    const startupIds = await this.statisticsRepository.getStartupIds(filters.userId, isAdmin);

    if (startupIds.length === 0 && !isAdmin) {
      return this.getEmptyStatistics();
    }

    const newsIds = filters.contentType === 'all' || filters.contentType === 'news'
      ? await this.statisticsRepository.getNewsIds(startupIds)
      : [];

    const eventIds = (filters.contentType === 'all' || filters.contentType === 'event') && isAdmin
      ? await this.statisticsRepository.getEventIds()
      : [];

    const [
      totalLikes,
      totalBookmarks,
      totalFollows,
      startupStats,
      newsStats,
      eventStats,
      dailyInteractionEvents
    ] = await Promise.all([
      this.getTotalLikes(filters, startupIds, newsIds, eventIds),
      this.getTotalBookmarks(filters, startupIds, newsIds, eventIds),
      this.statisticsRepository.getTotalFollows(filters, startupIds),
      this.getStartupStats(filters, startupIds),
      this.getNewsStats(filters, newsIds),
      this.getEventStats(filters, eventIds, isAdmin),
      this.getInteractionEvents(filters, startupIds, newsIds, eventIds)
    ]);

    const overview = this.buildOverview(
      startupStats,
      newsStats,
      eventStats,
      totalLikes,
      totalBookmarks,
      totalFollows,
      filters
    );

    const charts = this.buildChartData(dailyInteractionEvents, filters);
    const topContent = this.buildTopContent(startupStats, newsStats, eventStats);

    const platformMetrics = isAdmin
      ? await this.statisticsRepository.getPlatformMetrics()
      : await this.statisticsRepository.getUserPlatformMetrics(startupIds, newsStats.length);

    return {
      overview,
      platform: platformMetrics,
      charts,
      topContent
    };
  }

  private async getTotalLikes(
    filters: StatisticsFilters,
    startupIds: number[],
    newsIds: number[],
    eventIds: number[]
  ): Promise<number> {
    if (filters.contentType === 'startup') {
      return this.statisticsRepository.getTotalLikes(filters, startupIds);
    } else if (filters.contentType === 'news') {
      return this.statisticsRepository.getTotalLikes(filters, newsIds);
    } else if (filters.contentType === 'event') {
      return this.statisticsRepository.getTotalLikes(filters, eventIds);
    } else {
      const [startupLikes, newsLikes, eventLikes] = await Promise.all([
        startupIds.length > 0 ? this.statisticsRepository.getTotalLikes(
          { ...filters, contentType: 'startup' }, startupIds
        ) : 0,
        newsIds.length > 0 ? this.statisticsRepository.getTotalLikes(
          { ...filters, contentType: 'news' }, newsIds
        ) : 0,
        eventIds.length > 0 ? this.statisticsRepository.getTotalLikes(
          { ...filters, contentType: 'event' }, eventIds
        ) : 0
      ]);
      return startupLikes + newsLikes + eventLikes;
    }
  }

  private async getTotalBookmarks(
    filters: StatisticsFilters,
    startupIds: number[],
    newsIds: number[],
    eventIds: number[]
  ): Promise<number> {
    if (filters.contentType === 'startup') {
      return this.statisticsRepository.getTotalBookmarks(filters, startupIds);
    } else if (filters.contentType === 'news') {
      return this.statisticsRepository.getTotalBookmarks(filters, newsIds);
    } else if (filters.contentType === 'event') {
      return this.statisticsRepository.getTotalBookmarks(filters, eventIds);
    } else {
      const [startupBookmarks, newsBookmarks, eventBookmarks] = await Promise.all([
        startupIds.length > 0 ? this.statisticsRepository.getTotalBookmarks(
          { ...filters, contentType: 'startup' }, startupIds
        ) : 0,
        newsIds.length > 0 ? this.statisticsRepository.getTotalBookmarks(
          { ...filters, contentType: 'news' }, newsIds
        ) : 0,
        eventIds.length > 0 ? this.statisticsRepository.getTotalBookmarks(
          { ...filters, contentType: 'event' }, eventIds
        ) : 0
      ]);
      return startupBookmarks + newsBookmarks + eventBookmarks;
    }
  }

  private async getStartupStats(filters: StatisticsFilters, startupIds: number[]): Promise<ContentStats[]> {
    return (filters.contentType === 'startup' || filters.contentType === 'all') && startupIds.length > 0
      ? this.statisticsRepository.getStartupStats(startupIds)
      : [];
  }

  private async getNewsStats(filters: StatisticsFilters, newsIds: number[]): Promise<ContentStats[]> {
    return (filters.contentType === 'news' || filters.contentType === 'all') && newsIds.length > 0
      ? this.statisticsRepository.getNewsStats(newsIds)
      : [];
  }

  private async getEventStats(filters: StatisticsFilters, eventIds: number[], isAdmin: boolean): Promise<ContentStats[]> {
    return (filters.contentType === 'event' || filters.contentType === 'all') && isAdmin && eventIds.length > 0
      ? this.statisticsRepository.getEventStats(eventIds)
      : [];
  }

  private async getInteractionEvents(
    filters: StatisticsFilters,
    startupIds: number[],
    newsIds: number[],
    eventIds: number[]
  ): Promise<InteractionEvent[]> {
    const allTargetIds = [...startupIds, ...newsIds, ...eventIds];
    return this.statisticsRepository.getInteractionEvents(filters, allTargetIds);
  }

  private buildOverview(
    startupStats: ContentStats[],
    newsStats: ContentStats[],
    eventStats: ContentStats[],
    totalLikes: number,
    totalBookmarks: number,
    totalFollows: number,
    filters: StatisticsFilters
  ): StatisticsOverview {
    let totalViews = 0;

    if (filters.contentType === 'startup' || filters.contentType === 'all') {
      totalViews += startupStats.reduce((sum, s) => sum + s.viewsCount, 0);
    }
    if (filters.contentType === 'news' || filters.contentType === 'all') {
      totalViews += newsStats.reduce((sum, n) => sum + n.viewsCount, 0);
    }
    if (filters.contentType === 'event' || filters.contentType === 'all') {
      totalViews += eventStats.reduce((sum, e) => sum + e.viewsCount, 0);
    }

    const totalInteractions = totalLikes + totalBookmarks;
    const conversionRate = totalViews > 0 ? totalInteractions / totalViews : 0;

    return {
      totalViews,
      totalLikes,
      totalBookmarks,
      totalFollows,
      totalActiveUsers: startupStats.length,
      conversionRate,
      totalSessions: 0,
      viewsThisMonth: totalViews,
      lastUpdated: new Date().toISOString()
    };
  }

  private buildChartData(dailyInteractionEvents: InteractionEvent[], filters: StatisticsFilters): ChartData {
    const dailyEventCounts = new Map<string, { views: number; interactions: number }>();

    const days = filters.startDate
      ? Math.ceil((new Date().getTime() - filters.startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 30;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyEventCounts.set(dateKey, { views: 0, interactions: 0 });
    }

    dailyInteractionEvents.forEach(event => {
      const dateKey = event.occurredAt.toISOString().split('T')[0];
      const current = dailyEventCounts.get(dateKey) || { views: 0, interactions: 0 };

      if (event.eventType === 'VIEW') {
        current.views++;
      } else if (['LIKE', 'BOOKMARK', 'FOLLOW'].includes(event.eventType)) {
        current.interactions++;
      }

      dailyEventCounts.set(dateKey, current);
    });

    const sortedDates = Array.from(dailyEventCounts.keys()).sort();
    const monthlyViews = sortedDates.map(date => dailyEventCounts.get(date)?.views || 0);
    const monthlyInteractions = sortedDates.map(date => dailyEventCounts.get(date)?.interactions || 0);

    return {
      monthlyViews: monthlyViews.length > 0 ? monthlyViews : [0],
      activeUsers: monthlyInteractions.length > 0 ? monthlyInteractions : [0]
    };
  }

  private buildTopContent(
    startupStats: ContentStats[],
    newsStats: ContentStats[],
    eventStats: ContentStats[]
  ): TopContent {
    return {
      startups: startupStats
        .sort((a, b) => b.viewsCount - a.viewsCount)
        .slice(0, 5),
      events: eventStats
        .sort((a, b) => b.viewsCount - a.viewsCount)
        .slice(0, 5),
      news: newsStats
        .sort((a, b) => b.viewsCount - a.viewsCount)
        .slice(0, 5)
    };
  }

  private getEmptyStatistics(): StatisticsData {
    return {
      overview: {
        totalViews: 0,
        totalLikes: 0,
        totalBookmarks: 0,
        totalFollows: 0,
        totalActiveUsers: 0,
        conversionRate: 0,
        totalSessions: 0,
        viewsThisMonth: 0,
        lastUpdated: new Date().toISOString()
      },
      charts: {
        monthlyViews: [0],
        activeUsers: [0]
      },
      topContent: {
        startups: [],
        events: [],
        news: []
      }
    };
  }
}
