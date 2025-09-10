/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "./client";
import { PortfolioRepository } from "../../../domain/repositories/PortfolioRepository";
import { PortfolioData } from "../../../domain/interfaces/Portfolio";

export class PortfolioRepositoryPrisma implements PortfolioRepository {
  async getForInvestor(investorId: number, months = 12): Promise<PortfolioData> {
    // Recent DEAL opportunities for this investor as investments
    const rows = await (prisma as any).$queryRawUnsafe(
      `SELECT o.id,
              CASE WHEN o.source_type = 'STARTUP' THEN o.source_id ELSE o.target_id END AS startup_id,
              (SELECT name FROM "S_STARTUP" s WHERE s.id = CASE WHEN o.source_type = 'STARTUP' THEN o.source_id ELSE o.target_id END) AS startup_name,
              (SELECT sector FROM "S_STARTUP" s WHERE s.id = CASE WHEN o.source_type = 'STARTUP' THEN o.source_id ELSE o.target_id END) AS sector,
              (SELECT maturity FROM "S_STARTUP" s WHERE s.id = CASE WHEN o.source_type = 'STARTUP' THEN o.source_id ELSE o.target_id END) AS maturity,
              o.proposed_amount_eur::numeric AS amount_eur,
              o.updated_at AS invested_at,
              o.status
       FROM "OPPORTUNITY" o
       WHERE o.status = 'DEAL'::"OpportunityStatus"
         AND ((o.source_type = 'INVESTOR' AND o.source_id = $1 AND o.target_type = 'STARTUP')
           OR (o.target_type = 'INVESTOR' AND o.target_id = $1 AND o.source_type = 'STARTUP'))
       ORDER BY o.updated_at DESC
       LIMIT 200;`,
      investorId
    );

    type Row = { id: string; startup_id: number; startup_name: string; sector: string; maturity: string; amount_eur: number | null; invested_at: Date; status: string };
    const items = (rows as Row[]).map(r => ({
      id: r.id,
      startupId: r.startup_id,
      startupName: r.startup_name ?? `Startup #${r.startup_id}`,
      amount: Number(r.amount_eur ?? 0),
      currentValue: Number(r.amount_eur ?? 0), // simple proxy until we have valuations
      returnRate: 0,
      sector: r.sector ?? 'Unknown',
      investmentDate: r.invested_at.toISOString(),
      status: 'active' as const,
      maturity: r.maturity ?? 'Unknown',
    }));

    const totalInvestments = items.length;
    const totalInvested = items.reduce((s, it) => s + (it.amount || 0), 0);
    const totalValue = items.reduce((s, it) => s + (it.currentValue || 0), 0);
    const totalROI = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

    // sector distribution
    const sectorMap = new Map<string, { amount: number; count: number }>();
    items.forEach(it => {
      const key = it.sector || 'Unknown';
      const e = sectorMap.get(key) || { amount: 0, count: 0 };
      e.amount += it.amount || 0;
      e.count += 1;
      sectorMap.set(key, e);
    });
    const sectorDistribution = Array.from(sectorMap.entries()).map(([sector, d]) => ({
      sector,
      amount: d.amount,
      percentage: totalInvested > 0 ? (d.amount / totalInvested) * 100 : 0,
      count: d.count,
    })).sort((a, b) => b.amount - a.amount);

    // naive monthly returns placeholder (0) until valuations exist
    const monthlyReturns = Array.from({ length: months }, () => 0);
    const benchmarkReturns = Array.from({ length: months }, () => 0);

    const bestPerformer = items[0]?.startupName ?? 'N/A';
    const worstPerformer = items[items.length - 1]?.startupName ?? 'N/A';
    const activeInvestments = items.length; // without position status, assume active
    const averageReturn = totalInvestments > 0 ? totalROI / totalInvestments : 0;

    return {
      overview: {
        totalInvestments,
        totalValue,
        activeInvestments,
        averageReturn,
        bestPerformer,
        worstPerformer,
        totalROI,
        monthlyReturn: monthlyReturns[monthlyReturns.length - 1] || 0,
      },
      investments: items,
      sectorDistribution,
      performance: { monthlyReturns, benchmarkReturns },
    };
  }
}
