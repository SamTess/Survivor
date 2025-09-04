import prisma from "./client";
import { EventRepository } from "../../../domain/repositories/EventRepository";
import { Event } from "../../../domain/interfaces/Event";

export class EventRepositoryPrisma implements EventRepository {
  private mapPrismaToEvent(prismaEvent: {
    id: number;
    name: string;
    description: string | null;
    image_data: Uint8Array | null;
    dates: Date | null;
    location: string | null;
    event_type: string | null;
    target_audience: string | null;
    created_at: Date;
  }): Event {
    return {
      id: prismaEvent.id,
      name: prismaEvent.name,
      description: prismaEvent.description || undefined,
      dates: prismaEvent.dates?.toISOString() || undefined,
      location: prismaEvent.location || undefined,
      event_type: prismaEvent.event_type || undefined,
      target_audience: prismaEvent.target_audience || undefined,
      created_at: prismaEvent.created_at,
      updated_at: prismaEvent.created_at, // Prisma doesn't have updated_at for events
  // Provide an URL to fetch the image instead of embedding binary
  image_url: prismaEvent.image_data ? `/api/events/${prismaEvent.id}/image` : undefined,
    };
  }

  async create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const created = await prisma.s_EVENT.create({
      data: {
        name: event.name,
        description: event.description || null,
        dates: event.dates ? new Date(event.dates) : null,
        location: event.location || null,
        event_type: event.event_type || null,
        target_audience: event.target_audience || null,
      },
    });

    return this.mapPrismaToEvent(created);
  }

  async getById(id: number): Promise<Event | null> {
    const event = await prisma.s_EVENT.findUnique({
      where: { id },
    });

    if (!event) return null;
    return this.mapPrismaToEvent(event);
  }

  async getAll(): Promise<Event[]> {
    const events = await prisma.s_EVENT.findMany({
      orderBy: { created_at: 'desc' },
    });

    return events.map(event => this.mapPrismaToEvent(event));
  }

  async getByEventType(eventType: string): Promise<Event[]> {
    const events = await prisma.s_EVENT.findMany({
      where: { event_type: eventType },
      orderBy: { created_at: 'desc' },
    });

    return events.map(event => this.mapPrismaToEvent(event));
  }

  async getByTargetAudience(targetAudience: string): Promise<Event[]> {
    const events = await prisma.s_EVENT.findMany({
      where: { target_audience: targetAudience },
      orderBy: { created_at: 'desc' },
    });

    return events.map(event => this.mapPrismaToEvent(event));
  }

  async getByLocation(location: string): Promise<Event[]> {
    const events = await prisma.s_EVENT.findMany({
      where: { location },
      orderBy: { created_at: 'desc' },
    });

    return events.map(event => this.mapPrismaToEvent(event));
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    const events = await prisma.s_EVENT.findMany({
      where: {
        dates: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { dates: 'asc' },
    });

    return events.map(event => this.mapPrismaToEvent(event));
  }

  async getUpcoming(): Promise<Event[]> {
    const now = new Date();
    const events = await prisma.s_EVENT.findMany({
      where: {
        dates: {
          gte: now,
        },
      },
      orderBy: { dates: 'asc' },
    });

    return events.map(event => this.mapPrismaToEvent(event));
  }

  async search(query: string): Promise<Event[]> {
    const events = await prisma.s_EVENT.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
          { event_type: { contains: query, mode: 'insensitive' } },
          { target_audience: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { created_at: 'desc' },
    });

    return events.map(event => this.mapPrismaToEvent(event));
  }

  async update(id: number, event: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>): Promise<Event | null> {
    try {
      const updated = await prisma.s_EVENT.update({
        where: { id },
        data: {
          ...(event.name && { name: event.name }),
          ...(event.description !== undefined && { description: event.description }),
          ...(event.dates !== undefined && { dates: event.dates ? new Date(event.dates) : null }),
          ...(event.location !== undefined && { location: event.location }),
          ...(event.event_type !== undefined && { event_type: event.event_type }),
          ...(event.target_audience !== undefined && { target_audience: event.target_audience }),
        },
      });

      return this.mapPrismaToEvent(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.s_EVENT.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getPaginated(page: number, limit: number): Promise<{ events: Event[], total: number }> {
    const skip = (page - 1) * limit;
    
    const [events, total] = await Promise.all([
      prisma.s_EVENT.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.s_EVENT.count(),
    ]);

    return {
      events: events.map(event => this.mapPrismaToEvent(event)),
      total,
    };
  }
}
