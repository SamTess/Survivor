import prisma from './client';
import { InvestmentFundRepository } from '../../../domain/repositories/InvestmentFundRepository';
import { InvestmentFund } from '../../../domain/interfaces/InvestmentFund';

export class InvestmentFundRepositoryPrisma implements InvestmentFundRepository {
  async getByInvestor(investorId: number): Promise<InvestmentFund[]> {
  const anyPrisma = prisma as unknown as Record<string, unknown>;
  const delegate = (anyPrisma as unknown as Record<string, unknown>)['iNVESTMENT_FUND'] as unknown;
  let rows: Array<Record<string, unknown>>;
  if (delegate && typeof (delegate as { findMany?: unknown }).findMany === 'function') {
    rows = await (delegate as { findMany: (args: { where: { investor_id: number } }) => Promise<Array<Record<string, unknown>>> }).findMany({ where: { investor_id: investorId } });
  } else {
    rows = await (prisma as unknown as { $queryRawUnsafe: <T=unknown>(sql: string, ...params: unknown[]) => Promise<T> }).$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT * FROM "INVESTMENT_FUND" WHERE investor_id = $1 ORDER BY created_at DESC;`,
      investorId
    );
  }
    return rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: r.id as string,
        investor_id: r.investor_id as number,
        name: r.name as string,
        vintage: (r.vintage as number | null) ?? null,
        aum_eur: r.aum_eur ? Number(r.aum_eur as number) : null,
        dry_powder_eur: r.dry_powder_eur ? Number(r.dry_powder_eur as number) : null,
        investment_period_start: (r.investment_period_start as Date | null) ?? null,
        investment_period_end: (r.investment_period_end as Date | null) ?? null,
        ticket_min_eur: r.ticket_min_eur ? Number(r.ticket_min_eur as number) : null,
        ticket_max_eur: r.ticket_max_eur ? Number(r.ticket_max_eur as number) : null,
        follow_on_ratio: r.follow_on_ratio ? Number(r.follow_on_ratio as number) : null,
        sector_focus: (r.sector_focus as string[]) ?? [],
        geo_focus: (r.geo_focus as string[]) ?? [],
        stage_focus: (r.stage_focus as string[]) ?? [],
      } as InvestmentFund;
    });
  }
}
