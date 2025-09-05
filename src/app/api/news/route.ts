import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '../../../application/services/news/NewsService';
import { NewsRepositoryPrisma } from '../../../infrastructure/persistence/prisma/NewsRepositoryPrisma';

const newsRepository = new NewsRepositoryPrisma();
const newsService = new NewsService(newsRepository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startupId = searchParams.get('startupId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (search) {
      const news = await newsService.searchNews(search);
      return NextResponse.json({ success: true, data: news });
    }

    if (startupId) {
      const id = parseInt(startupId);
      if (isNaN(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid startup ID' },
          { status: 400 }
        );
      }
      const news = await newsService.getNewsByStartupId(id);
      return NextResponse.json({ success: true, data: news });
    }

    if (category) {
      const news = await newsService.getNewsByCategory(category);
      return NextResponse.json({ success: true, data: news });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format' },
          { status: 400 }
        );
      }
      const news = await newsService.getNewsByDateRange(start, end);
      return NextResponse.json({ success: true, data: news });
    }

    if (page > 1 || limit !== 10) {
      const result = await newsService.getNewsPaginated(page, limit);
      return NextResponse.json({ 
        success: true, 
        data: result.news,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    }

    const news = await newsService.getAllNews();
    return NextResponse.json({ success: true, data: news });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch news' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const news = await newsService.createNews(body);
    
    return NextResponse.json({ 
      success: true, 
      data: news,
      message: 'News created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create news' 
      },
      { status: 400 }
    );
  }
}
