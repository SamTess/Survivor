import { NextResponse } from 'next/server';
import { AdminStatsService } from '../../../../application/services/AdminStatsService';

const adminStatsService = new AdminStatsService();

export async function GET() {
  try {
    const data = await adminStatsService.getRecentActivities();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activities' },
      { status: 500 }
    );
  }
}