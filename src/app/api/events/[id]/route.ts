import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../application/services/events/EventService';
import { EventRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/EventRepositoryPrisma';

const eventRepository = new EventRepositoryPrisma();
const eventService = new EventService(eventRepository);

/**
 * @api {get} /events/:id Get Event by ID
 * @apiName GetEventById
 * @apiGroup Events
 * @apiVersion 0.1.0
 * @apiDescription Retrieve a specific event by its ID
 *
 * @apiParam {Number} id Event ID
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object} data Event object
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "Tech Conference 2025",
 *         "description": "Annual technology conference",
 *         "eventType": "Conference",
 *         "location": "San Francisco"
 *       }
 *     }
 *
 * @apiError (Error 400) {Boolean} success false
 * @apiError (Error 400) {String} error Invalid event ID
 * @apiError (Error 404) {Boolean} success false
 * @apiError (Error 404) {String} error Event not found
 * @apiError (Error 500) {Boolean} success false
 * @apiError (Error 500) {String} error Failed to fetch event
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Event not found"
 *     }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await eventService.getEventById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: event });

  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch event'
      },
      { status: 500 }
    );
  }
}

/**
 * @api {put} /events/:id Update Event
 * @apiName UpdateEvent
 * @apiGroup Events
 * @apiVersion 0.1.0
 * @apiDescription Update an existing event
 *
 * @apiParam {Number} id Event ID
 * @apiParam {String} [name] Event name
 * @apiParam {String} [description] Event description
 * @apiParam {String} [eventType] Event type
 * @apiParam {String} [targetAudience] Target audience
 * @apiParam {String} [location] Event location
 * @apiParam {String} [startDate] Event start date (ISO format)
 * @apiParam {String} [endDate] Event end date (ISO format)
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Updated Tech Conference 2025",
 *       "description": "Updated description",
 *       "location": "New York"
 *     }
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object} data Updated event object
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "Updated Tech Conference 2025",
 *         "description": "Updated description",
 *         "location": "New York"
 *       },
 *       "message": "Event updated successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success false
 * @apiError (Error 400) {String} error Invalid event ID or failed to update
 * @apiError (Error 404) {Boolean} success false
 * @apiError (Error 404) {String} error Event not found
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Event not found"
 *     }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const event = await eventService.updateEvent(id, body);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });

  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update event'
      },
      { status: 400 }
    );
  }
}

/**
 * @api {delete} /events/:id Delete Event
 * @apiName DeleteEvent
 * @apiGroup Events
 * @apiVersion 0.1.0
 * @apiDescription Delete an existing event
 *
 * @apiParam {Number} id Event ID
 *
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Event deleted successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success false
 * @apiError (Error 400) {String} error Invalid event ID
 * @apiError (Error 404) {Boolean} success false
 * @apiError (Error 404) {String} error Event not found
 * @apiError (Error 500) {Boolean} success false
 * @apiError (Error 500) {String} error Failed to delete event
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Event not found"
 *     }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const deleted = await eventService.deleteEvent(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Event not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete event'
      },
      { status: 500 }
    );
  }
}
