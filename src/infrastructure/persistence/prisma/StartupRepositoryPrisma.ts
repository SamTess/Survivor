import prisma from "./client";
import { Startup } from "../../../domain/entities/Startup";
import { StartupRepository } from "../../repositories/StartupRepository";
import { S_STARTUP } from "@prisma/client";


function map(row: S_STARTUP): Startup {
  return {
    id: row.id,
    name: row.name,
    legal_status: row.legal_status,
    address: row.address,
    phone: row.phone,
    sector: row.sector,
    maturity: row.maturity,
    email: row.email,
    description: row.description,
    image_data: row.image_data,
    created_at: row.created_at,
  };
}

export class StartupRepositoryPrisma implements StartupRepository {
  async getById(id: number): Promise<Startup | null> {
    const row = await prisma.s_STARTUP.findUnique({ where: { id } });
    return row ? map(row) : null;
  }

  async listFeatured(limit = 3): Promise<Startup[]> {
    const rows = await prisma.s_STARTUP.findMany({ take: limit, orderBy: { created_at: "desc" } });
    return rows.map(map);
  }

  async listAll(): Promise<Startup[]> {
    const rows = await prisma.s_STARTUP.findMany({ orderBy: { created_at: "desc" } });
    return rows.map(map);
  }

  async save(startup: Startup): Promise<void> {
    await prisma.s_STARTUP.update({
      where: { id: startup.id },
      data: {
        name: startup.name,
        legal_status: startup.legal_status,
        address: startup.address,
        phone: startup.phone,
        sector: startup.sector,
        maturity: startup.maturity,
        email: startup.email,
        description: startup.description,
        image_data: startup.image_data,
      },
    });
  }
}
