import { NextResponse } from 'next/server';
import { AdminStatsService } from '../../../../application/services/AdminStatsService';

const adminStatsService = new AdminStatsService();

export async function GET() {
  try {
    const statsDetails = await adminStatsService.getDetailedStats();

    return NextResponse.json({
      success: true,
      data: statsDetails,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching admin stats details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin statistics details',
        generatedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
