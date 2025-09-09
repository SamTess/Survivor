import { NextResponse } from 'next/server';
import { AdminStatsService } from '../../../../application/services/AdminStatsService';

const adminStatsService = new AdminStatsService();

export async function GET() {
  try {
    const stats = await adminStatsService.getBasicStats();

    return NextResponse.json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin statistics',
        generatedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}