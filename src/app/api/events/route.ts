import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../application/services/events/EventService';
import { EventRepositoryPrisma } from '../../../infrastructure/persistence/prisma/EventRepositoryPrisma';

const eventRepository = new EventRepositoryPrisma();
const eventService = new EventService(eventRepository);

/**
 * @openapi
 * /events:
 *   get:
 *     summary: Get Events
 *     description: Retrieve a list of events with optional filtering and pagination
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Filter by event type
 *       - in: query
 *         name: targetAudience
 *         schema:
 *           type: string
 *         description: Filter by target audience
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for event name or description
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date filter (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date filter (ISO format)
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Filter for upcoming events only
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Tech Conference 2025"
 *                       eventType:
 *                         type: string
 *                         example: "Conference"
 *                       location:
 *                         type: string
 *                         example: "San Francisco"
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-15T09:00:00Z"
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-15T17:00:00Z"
 *                 pagination:
 *                   type: object
 *                   description: Pagination information (when using page/limit)
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch events"
 */
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

/**
 * @openapi
 * /events:
 *   post:
 *     summary: Create Event
 *     description: Create a new event
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Event name
 *                 example: "Tech Conference 2025"
 *               description:
 *                 type: string
 *                 description: Event description
 *                 example: "Annual technology conference"
 *               eventType:
 *                 type: string
 *                 description: Event type
 *                 example: "Conference"
 *               targetAudience:
 *                 type: string
 *                 description: Target audience
 *                 example: "Developers"
 *               location:
 *                 type: string
 *                 description: Event location
 *                 example: "San Francisco"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Event start date (ISO format)
 *                 example: "2025-10-15T09:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Event end date (ISO format)
 *                 example: "2025-10-15T17:00:00Z"
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Event website URL
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Tech Conference 2025"
 *                     description:
 *                       type: string
 *                       example: "Annual technology conference"
 *                     eventType:
 *                       type: string
 *                       example: "Conference"
 *                 message:
 *                   type: string
 *                   example: "Event created successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to create event"
 */
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
