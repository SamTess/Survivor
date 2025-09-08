import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../application/services/events/EventService';
import { EventRepositoryPrisma } from '../../../infrastructure/persistence/prisma/EventRepositoryPrisma';

const eventRepository = new EventRepositoryPrisma();
const eventService = new EventService(eventRepository);

/**
 * @api {get} /events Get Events
 * @apiName GetEvents
 * @apiGroup Events
 * @apiVersion 0.1.0
 * @apiDescription Retrieve a list of events with optional filtering and pagination
 *
 * @apiParam {Number} [page=1] Page number for pagination
 * @apiParam {Number} [limit=10] Number of items per page
 * @apiParam {String} [eventType] Filter by event type
 * @apiParam {String} [targetAudience] Filter by target audience
 * @apiParam {String} [location] Filter by location
 * @apiParam {String} [search] Search term for event name or description
 * @apiParam {String} [startDate] Start date filter (ISO format)
 * @apiParam {String} [endDate] End date filter (ISO format)
 * @apiParam {Boolean} [upcoming] Filter for upcoming events only
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object[]} data Array of event objects
 * @apiSuccess {Object} [pagination] Pagination information (when using page/limit)
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
 *           "id": 1,
 *           "name": "Tech Conference 2025",
 *           "eventType": "Conference",
 *           "location": "San Francisco",
 *           "startDate": "2025-10-15T09:00:00Z",
 *           "endDate": "2025-10-15T17:00:00Z"
 *         }
 *       ]
 *     }
 *
 * @apiError (Error 500) {Boolean} success false
 * @apiError (Error 500) {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "success": false,
 *       "error": "Failed to fetch events"
 *     }
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
 * @api {post} /events Create Event
 * @apiName CreateEvent
 * @apiGroup Events
 * @apiVersion 0.1.0
 * @apiDescription Create a new event
 *
 * @apiParam {String} name Event name
 * @apiParam {String} [description] Event description
 * @apiParam {String} [eventType] Event type
 * @apiParam {String} [targetAudience] Target audience
 * @apiParam {String} [location] Event location
 * @apiParam {String} [startDate] Event start date (ISO format)
 * @apiParam {String} [endDate] Event end date (ISO format)
 * @apiParam {String} [website] Event website URL
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Tech Conference 2025",
 *       "description": "Annual technology conference",
 *       "eventType": "Conference",
 *       "targetAudience": "Developers",
 *       "location": "San Francisco",
 *       "startDate": "2025-10-15T09:00:00Z",
 *       "endDate": "2025-10-15T17:00:00Z"
 *     }
 *
 * @apiSuccess (Success 201) {Boolean} success Request success status
 * @apiSuccess (Success 201) {Object} data Created event object
 * @apiSuccess (Success 201) {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "Tech Conference 2025",
 *         "description": "Annual technology conference",
 *         "eventType": "Conference"
 *       },
 *       "message": "Event created successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success false
 * @apiError (Error 400) {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": "Failed to create event"
 *     }
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
