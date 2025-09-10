/*
  List opportunities for an INVESTOR id directly via Prisma.
  Usage: npm run list:investor-opps -- 18
*/
import prisma from "../src/infrastructure/persistence/prisma/client";

async function main() {
  const arg = process.env.INVESTOR_ID || process.argv.slice(2).find((a) => /^\d+$/.test(a) ?? false) || '';
  const investorId = Number(arg);
  if (!Number.isFinite(investorId) || investorId <= 0) {
    console.log("Usage: npm run list:investor-opps -- <INVESTOR_ID>");
    console.log("Or: INVESTOR_ID=18 npm run list:investor-opps");
    process.exit(1);
  }

  const rows = await prisma.$queryRawUnsafe<Array<{ id: string; direction: string; source_type: string; source_id: number; target_type: string; target_id: number; status: string; score: unknown; updated_at: string | Date; deal_type?: string | null; round?: string | null; proposed_amount_eur?: unknown; fund_id?: string | null; budget_fit?: string | null; budget_fit_score?: unknown; term_deadline?: Date | null }>>(
    `SELECT id, direction, source_type, source_id, target_type, target_id, status, score, updated_at,
            deal_type, round, proposed_amount_eur, fund_id, budget_fit, budget_fit_score, term_deadline
     FROM "OPPORTUNITY"
     WHERE (source_type = 'INVESTOR' AND source_id = $1)
        OR (target_type = 'INVESTOR' AND target_id = $1)
     ORDER BY updated_at DESC
     LIMIT 50;`,
    investorId
  );
  const countRows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
    `SELECT COUNT(*)::bigint AS count FROM "OPPORTUNITY"
     WHERE (source_type = 'INVESTOR' AND source_id = $1)
        OR (target_type = 'INVESTOR' AND target_id = $1);`,
    investorId
  );
  const total = Number(countRows[0]?.count ?? 0);

  console.log(`Investor #${investorId} → ${total} opportunities`);
  if (rows && rows.length) {
    const sample = rows.slice(0, 10).map((o) => ({
      id: o.id,
      status: o.status,
      score: o.score,
      dir: o.direction,
      src: `${o.source_type}#${o.source_id}`,
      tgt: `${o.target_type}#${o.target_id}`,
      deal_type: o.deal_type ?? null,
      round: o.round ?? null,
      proposed_amount_eur: o.proposed_amount_eur ?? null,
      fund_id: o.fund_id ?? null,
      budget_fit: o.budget_fit ?? null,
      budget_fit_score: o.budget_fit_score ?? null,
      term_deadline: o.term_deadline ?? null,
    }));
    console.table(sample);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
