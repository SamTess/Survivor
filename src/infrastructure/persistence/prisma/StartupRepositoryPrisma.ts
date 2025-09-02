import prisma from "./client";
import { StartupRepository } from "../../repositories/StartupRepository";
import { StartupDetailApiResponse, StartupListApiResponse, StartupFounder } from "../../../domain/interfaces/Startup";

const nz = (v: string | undefined | null) => v ?? "";

export class StartupRepositoryPrisma implements StartupRepository {
  async upsertList(item: StartupListApiResponse): Promise<void> {
    await prisma.s_STARTUP.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        email: item.email,
        phone: nz(item.phone),
        address: nz(item.address),
        legal_status: nz(item.legal_status),
        sector: nz(item.sector),
        maturity: nz(item.maturity),
      },
      create: {
        id: item.id,
        name: item.name,
        email: item.email,
        phone: nz(item.phone),
        address: nz(item.address),
        legal_status: nz(item.legal_status),
        sector: nz(item.sector),
        maturity: nz(item.maturity),
        description: "",
      },
    });
  }

  async upsertDetail(item: StartupDetailApiResponse): Promise<void> {
  await prisma.$transaction(async (tx: typeof prisma) => {
      await tx.s_STARTUP.upsert({
        where: { id: item.id },
        update: {
          name: item.name,
          email: item.email,
          phone: nz(item.phone),
          address: nz(item.address),
          legal_status: nz(item.legal_status),
          sector: nz(item.sector),
          maturity: nz(item.maturity),
        },
        create: {
          id: item.id,
          name: item.name,
          email: item.email,
          phone: nz(item.phone),
          address: nz(item.address),
          legal_status: nz(item.legal_status),
          sector: nz(item.sector),
          maturity: nz(item.maturity),
          description: "",
        },
      });
      const existingDetails = await tx.s_STARTUP_DETAIL.findMany({ where: { startup_id: item.id } });
      if (!existingDetails.length) {
        await tx.s_STARTUP_DETAIL.create({
          data: {
            startup_id: item.id,
            description: undefined, // unknown
            website_url: item.website_url,
            social_media_url: item.social_media_url,
            project_status: item.project_status,
            needs: item.needs,
          },
        });
      } else {
        await tx.s_STARTUP_DETAIL.updateMany({
          where: { startup_id: item.id },
          data: {
            website_url: item.website_url,
            social_media_url: item.social_media_url,
            project_status: item.project_status,
            needs: item.needs,
          },
        });
      }
    });
  }

  async upsertFounders(founders: StartupFounder[], startupId: number): Promise<void> {
    if (!founders?.length) return;
  await prisma.$transaction(async (tx: typeof prisma) => {
      // Remove founders not present anymore? We'll soft sync by inserting missing ones only.
      for (const f of founders) {
        // We need a user row to satisfy foreign key. Try to find by id mapped maybe by email not provided.
        // We'll synthesize an email to keep uniqueness stable.
        const syntheticEmail = `founder-${f.id}@external.local`;
        const user = await tx.s_USER.upsert({
          where: { id: f.id },
            update: { name: f.name, email: syntheticEmail, role: "FOUNDER", address: "", password_hash: "", },
            create: { id: f.id, name: f.name, email: syntheticEmail, role: "FOUNDER", address: "", password_hash: "" },
        });
        // Upsert S_FOUNDER referencing same id? S_FOUNDER has its own autoincrement id; external founder id might collide with sequence but we can try to use given id.
        await tx.s_FOUNDER.upsert({
          where: { id: f.id },
          update: { startup_id: startupId, user_id: user.id },
          create: { id: f.id, startup_id: startupId, user_id: user.id },
        });
      }
    });
  }
}
