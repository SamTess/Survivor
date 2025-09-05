import { Event } from "../interfaces/Event";

export interface EventRepository {
  // Create
  create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event>;
  
  // Read
  getById(id: number): Promise<Event | null>;
  getAll(): Promise<Event[]>;
  getByEventType(eventType: string): Promise<Event[]>;
  getByTargetAudience(targetAudience: string): Promise<Event[]>;
  getByLocation(location: string): Promise<Event[]>;
  getByDateRange(startDate: Date, endDate: Date): Promise<Event[]>;
  getUpcoming(): Promise<Event[]>;
  search(query: string): Promise<Event[]>;
  
  // Update
  update(id: number, event: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>): Promise<Event | null>;
  
  // Delete
  delete(id: number): Promise<boolean>;
  
  // Pagination
  getPaginated(page: number, limit: number): Promise<{ events: Event[], total: number }>;
}
