import { NextResponse } from 'next/server';
import { AdminStatsService } from '../../../application/services/AdminStatsService';

export interface TrendData {
  totalUsers: string;
  activeProjects: string;
  NewsArticle: string;
  UpcommingEvents: string;
}

const adminStatsService = new AdminStatsService();

export async function GET() {
  try {
    const stats = await adminStatsService.getBasicStats();

    const trends: TrendData = {
      totalUsers: stats.totalUsers.trend,
      activeProjects: stats.activeProjects.trend,
      NewsArticle: stats.newsArticles.trend,
      UpcommingEvents: stats.upcomingEvents.trend
    };

    return NextResponse.json({
      success: true,
      data: trends,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate trends'
      },
      { status: 500 }
    );
  }
}
