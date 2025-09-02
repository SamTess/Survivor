import prisma from "../client";
import { Prisma } from "@prisma/client";
import { StartupRepository } from "../../../repositories/sync/StartupRepository";
import { StartupDetailApiResponse, StartupListApiResponse, StartupFounder } from "../../../../domain/interfaces/Startup";

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
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
            description: undefined,
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
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const f of founders) {
        const syntheticEmail = `founder-${f.id}@external.local`;
        const user = await tx.s_USER.upsert({
          where: { id: f.id },
            update: { name: f.name, email: syntheticEmail, role: "FOUNDER", address: "", password_hash: "", },
            create: { id: f.id, name: f.name, email: syntheticEmail, role: "FOUNDER", address: "", password_hash: "" },
        });
        await tx.s_FOUNDER.upsert({
          where: { id: f.id },
          update: { startup_id: startupId, user_id: user.id },
          create: { id: f.id, startup_id: startupId, user_id: user.id },
        });
      }
    });
  }
}
