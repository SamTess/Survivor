import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../application/services/events/EventService';
import { EventRepositoryPrisma } from '../../../infrastructure/persistence/prisma/EventRepositoryPrisma';

const eventRepository = new EventRepositoryPrisma();
const eventService = new EventService(eventRepository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const eventType = searchParams.get('eventType');
    const targetAudience = searchParams.get('targetAudience');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const upcoming = searchParams.get('upcoming') === 'true';

    if (search) {
      const events = await eventService.searchEvents(search);
      return NextResponse.json({ success: true, data: events });
    }

    if (upcoming) {
      const events = await eventService.getUpcomingEvents();
      return NextResponse.json({ success: true, data: events });
    }

    if (eventType) {
      const events = await eventService.getEventsByType(eventType);
      return NextResponse.json({ success: true, data: events });
    }

    if (targetAudience) {
      const events = await eventService.getEventsByTargetAudience(targetAudience);
      return NextResponse.json({ success: true, data: events });
    }

    if (location) {
      const events = await eventService.getEventsByLocation(location);
      return NextResponse.json({ success: true, data: events });
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
      const events = await eventService.getEventsByDateRange(start, end);
      return NextResponse.json({ success: true, data: events });
    }

    if (page > 1 || limit !== 10) {
      const result = await eventService.getEventsPaginated(page, limit);
      return NextResponse.json({ 
        success: true, 
        data: result.events,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    }

    const events = await eventService.getAllEvents();
    return NextResponse.json({ success: true, data: events });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch events' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const event = await eventService.createEvent(body);
    
    return NextResponse.json({ 
      success: true, 
      data: event,
      message: 'Event created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create event' 
      },
      { status: 400 }
    );
  }
}
