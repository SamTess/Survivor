import prisma from "./../client";
import { EventRepository } from "../../../repositories/sync/EventRepository";
import { EventApiResponse } from "../../../../domain/interfaces/Event";

export class EventRepositoryPrisma implements EventRepository {
  async upsert(item: EventApiResponse): Promise<void> {
    await prisma.s_EVENT.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        dates: item.dates ? new Date(item.dates) : null,
        location: item.location,
        description: item.description,
        event_type: item.event_type,
        target_audience: item.target_audience,
      },
      create: {
        id: item.id,
        name: item.name,
        dates: item.dates ? new Date(item.dates) : null,
        location: item.location,
        description: item.description,
        event_type: item.event_type,
        target_audience: item.target_audience,
      },
    });
  }

  async saveImage(eventId: number, data: Buffer): Promise<void> {
    await prisma.s_EVENT.update({ where: { id: eventId }, data: { image_data: data } });
  }
}
