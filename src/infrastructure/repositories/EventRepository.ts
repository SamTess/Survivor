import { EventApiResponse } from "../../domain/interfaces/Event";

export interface EventRepository {
  upsert(item: EventApiResponse): Promise<void>;
  saveImage(eventId: number, data: Buffer): Promise<void>;
}
