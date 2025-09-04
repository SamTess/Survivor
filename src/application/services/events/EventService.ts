import { EventRepository } from "../../../domain/repositories/EventRepository";
import { Event } from "../../../domain/interfaces/Event";

export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    if (!event.name) {
      throw new Error("Event name is required");
    }

    if (event.dates) {
      const eventDate = new Date(event.dates);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date format");
      }
    }

    return this.eventRepository.create(event);
  }

  async getEventById(id: number): Promise<Event | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid event ID");
    }

    return this.eventRepository.getById(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return this.eventRepository.getAll();
  }

  async getEventsByType(eventType: string): Promise<Event[]> {
    if (!eventType || eventType.trim().length === 0) {
      throw new Error("Event type cannot be empty");
    }

    return this.eventRepository.getByEventType(eventType.trim());
  }

  async getEventsByTargetAudience(targetAudience: string): Promise<Event[]> {
    if (!targetAudience || targetAudience.trim().length === 0) {
      throw new Error("Target audience cannot be empty");
    }

    return this.eventRepository.getByTargetAudience(targetAudience.trim());
  }

  async getEventsByLocation(location: string): Promise<Event[]> {
    if (!location || location.trim().length === 0) {
      throw new Error("Location cannot be empty");
    }

    return this.eventRepository.getByLocation(location.trim());
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new Error("Invalid date format");
    }

    if (startDate > endDate) {
      throw new Error("Start date must be before end date");
    }

    return this.eventRepository.getByDateRange(startDate, endDate);
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return this.eventRepository.getUpcoming();
  }

  async searchEvents(query: string): Promise<Event[]> {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters long");
    }

    return this.eventRepository.search(query.trim());
  }

  async updateEvent(id: number, updates: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>): Promise<Event | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid event ID");
    }

    if (updates.dates) {
      const eventDate = new Date(updates.dates);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date format");
      }
    }

    const existing = await this.eventRepository.getById(id);
    if (!existing) {
      throw new Error("Event not found");
    }

    return this.eventRepository.update(id, updates);
  }

  async deleteEvent(id: number): Promise<boolean> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid event ID");
    }

    const existing = await this.eventRepository.getById(id);
    if (!existing) {
      throw new Error("Event not found");
    }

    return this.eventRepository.delete(id);
  }

  async getEventsPaginated(page: number, limit: number): Promise<{ events: Event[], total: number }> {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error("Page must be a positive integer");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    return this.eventRepository.getPaginated(page, limit);
  }
}
