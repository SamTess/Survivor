import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../application/services/events/EventService';
import { EventRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/EventRepositoryPrisma';

const eventRepository = new EventRepositoryPrisma();
const eventService = new EventService(eventRepository);

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
