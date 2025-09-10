import prisma from './client';
import { OpportunityReadRepository, StartupForScoring } from '../../../domain/repositories/OpportunityReadRepository';
type StartupDetailRow = { needs?: string | null };
type StartupRow = {
  id: number;
  sector: string | null;
  description: string | null;
  maturity: string | null;
  address: string | null;
  created_at: Date;
  viewsCount: number;
  likesCount: number;
  bookmarksCount: number;
  details: StartupDetailRow[];
  ask_min_eur: unknown | null;
  ask_max_eur: unknown | null;
  round: string | null;
  revenue_arr_eur: unknown | null;
};

export class OpportunityReadRepositoryPrisma implements OpportunityReadRepository {
  async getStartupForScoring(id: number): Promise<StartupForScoring | null> {
  const s = await prisma.s_STARTUP.findUnique({ where: { id }, include: { details: true } });
    if (!s) return null;
    const row = s as unknown as StartupRow;
    const mapped: StartupForScoring = {
      id: row.id,
      sector: row.sector,
      description: row.description,
      maturity: row.maturity,
      address: row.address,
      created_at: row.created_at,
      viewsCount: row.viewsCount,
      likesCount: row.likesCount,
      bookmarksCount: row.bookmarksCount,
      details: row.details.map((d: StartupDetailRow) => ({ needs: d.needs ?? null })),
      ask_min_eur: row.ask_min_eur !== null && row.ask_min_eur !== undefined ? Number(row.ask_min_eur as number) : null,
      ask_max_eur: row.ask_max_eur !== null && row.ask_max_eur !== undefined ? Number(row.ask_max_eur as number) : null,
      round: row.round ?? null,
    };
    return mapped;
  }

  async getStartupsForScoring(): Promise<StartupForScoring[]> {
    const rows = await prisma.s_STARTUP.findMany({ include: { details: true } });
    return (rows as unknown as StartupRow[]).map((s: StartupRow) => ({
      id: s.id,
      sector: s.sector,
      description: s.description,
      maturity: s.maturity,
      address: s.address,
      created_at: s.created_at,
      viewsCount: s.viewsCount,
      likesCount: s.likesCount,
      bookmarksCount: s.bookmarksCount,
      details: s.details.map((d: StartupDetailRow) => ({ needs: d.needs ?? null })),
      ask_min_eur: s.ask_min_eur !== null && s.ask_min_eur !== undefined ? Number(s.ask_min_eur as number) : null,
      ask_max_eur: s.ask_max_eur !== null && s.ask_max_eur !== undefined ? Number(s.ask_max_eur as number) : null,
      round: s.round ?? null,
    }));
  }
}
