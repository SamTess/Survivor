import prisma from '../src/infrastructure/persistence/prisma/client';

// Seed a few DEAL opportunities per startup across different investors to provide
// a simple investment evolution history. Uses raw SQL upsert to satisfy NOT NULL/enum constraints.

type IdRow = { id: number };

function pickUnique<T>(arr: T[], k: number): T[] {
  const res: T[] = [];
  const pool = [...arr];
  while (res.length < k && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    res.push(pool[i]);
    pool.splice(i, 1);
  }
  return res;
}

function approxRound(amount: number): string {
  if (amount < 300_000) return 'PRE_SEED';
  if (amount < 1_200_000) return 'SEED';
  if (amount < 4_000_000) return 'A';
  if (amount < 10_000_000) return 'B';
  if (amount < 30_000_000) return 'C';
  return 'GROWTH';
}

async function main() {
  const investors = (await prisma.$queryRawUnsafe(`SELECT id FROM "S_INVESTOR" LIMIT 200;`)) as IdRow[];
  const startups = (await prisma.$queryRawUnsafe(`SELECT id FROM "S_STARTUP" LIMIT 50;`)) as IdRow[];
  if (!investors.length || !startups.length) {
    console.log('No investors or startups found; aborting.');
    return;
  }

  let inserted = 0;
  for (const s of startups) {
    const dealsCount = 2 + Math.floor(Math.random() * 4); // 2..5 deals
    const invIds = pickUnique(investors.map(i => i.id), dealsCount);
    let daysAgo = 30 * dealsCount;
    for (const invId of invIds) {
      const amount = Math.round((100_000 + Math.random() * 5_000_000) / 10_000) * 10_000; // round to 10k
      const round = approxRound(amount);
      const dealType = 'EQUITY';
      const when = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
      daysAgo -= 30 + Math.floor(Math.random() * 45);

      await prisma.$queryRawUnsafe(
        `INSERT INTO "OPPORTUNITY" (
            id, direction, source_type, source_id, target_type, target_id,
            score, score_breakdown, status, reason, next_action, owner_user_id,
            deal_type, round, proposed_amount_eur, valuation_pre_money_eur, ownership_target_pct,
            fund_id, budget_fit, budget_fit_score, pilot_estimated_cost_eur, pilot_budget_fit,
            term_deadline, created_at, updated_at
         ) VALUES (
            gen_random_uuid(), $1::"OpportunityDirection", $2::"EntityType", $3, $4::"EntityType", $5,
            $6, $7::jsonb, $8::"OpportunityStatus", $9, $10, $11,
            $12::"DealType", $13::"Round", $14, $15, $16,
            $17, $18::"BudgetFit", $19, $20, $21::"PilotBudgetFit",
            $22, NOW(), $23
         )
         ON CONFLICT (direction, source_type, source_id, target_type, target_id)
         DO UPDATE SET
           status = EXCLUDED.status,
           proposed_amount_eur = EXCLUDED.proposed_amount_eur,
           deal_type = EXCLUDED.deal_type,
           round = EXCLUDED.round,
           updated_at = EXCLUDED.updated_at;`,
        'I_TO_S', 'INVESTOR', invId, 'STARTUP', s.id,
        85, JSON.stringify({ tags: 20, text: 20, stage: 15, geo: 15, engagement: 15 }), 'DEAL', null, null, null,
        dealType, round, amount, null, null,
        null, 'UNKNOWN', null, null, 'UNKNOWN',
        null, when
      );
      inserted++;
    }
  }
  console.log(`Seeded/updated ~${inserted} DEAL opportunities across startups.`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
