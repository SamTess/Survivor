import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../application/services/events/EventService';
import { EventRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/EventRepositoryPrisma';

const eventRepository = new EventRepositoryPrisma();
const eventService = new EventService(eventRepository);

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Get Event by ID
 *     description: Retrieve a specific event by its ID
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Event ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Event retrieved successfully
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
 *                     location:
 *                       type: string
 *                       example: "San Francisco"
 *                     targetAudience:
 *                       type: string
 *                       example: "Developers"
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-15T09:00:00Z"
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-17T18:00:00Z"
 *       400:
 *         description: Invalid event ID
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
 *                   example: "Invalid event ID"
 *       404:
 *         description: Event not found
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
 *                   example: "Event not found"
 *       500:
 *         description: Failed to fetch event
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
 *                   example: "Failed to fetch event"
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
 * @openapi
 * /events/{id}:
 *   put:
 *     summary: Update Event
 *     description: Update an existing event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Event ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Event name
 *                 example: "Updated Tech Conference 2025"
 *               description:
 *                 type: string
 *                 description: Event description
 *                 example: "Updated description"
 *               eventType:
 *                 type: string
 *                 description: Event type
 *                 example: "Conference"
 *               targetAudience:
 *                 type: string
 *                 description: Target audience
 *                 example: "Developers and Tech Enthusiasts"
 *               location:
 *                 type: string
 *                 description: Event location
 *                 example: "New York"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Event start date (ISO format)
 *                 example: "2025-03-15T09:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Event end date (ISO format)
 *                 example: "2025-03-17T18:00:00Z"
 *     responses:
 *       200:
 *         description: Event updated successfully
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
 *                       example: "Updated Tech Conference 2025"
 *                     description:
 *                       type: string
 *                       example: "Updated description"
 *                     location:
 *                       type: string
 *                       example: "New York"
 *                     eventType:
 *                       type: string
 *                       example: "Conference"
 *                     targetAudience:
 *                       type: string
 *                       example: "Developers and Tech Enthusiasts"
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-15T09:00:00Z"
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-17T18:00:00Z"
 *                 message:
 *                   type: string
 *                   example: "Event updated successfully"
 *       400:
 *         description: Invalid event ID or failed to update
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
 *                   example: "Invalid event ID"
 *       404:
 *         description: Event not found
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
 *                   example: "Event not found"
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
 * @openapi
 * /events/{id}:
 *   delete:
 *     summary: Delete Event
 *     description: Delete an existing event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Event ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Event deleted successfully"
 *       400:
 *         description: Invalid event ID
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
 *                   example: "Invalid event ID"
 *       404:
 *         description: Event not found
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
 *                   example: "Event not found"
 *       500:
 *         description: Failed to delete event
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
 *                   example: "Failed to delete event"
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
