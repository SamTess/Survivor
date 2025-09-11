/*
  Enrich existing OPPORTUNITY rows with missing financial fields using heuristics
  - If round is null, infer from target STARTUP.round or ask_min/max
  - If deal_type missing, pick based on round
  - If proposed_amount_eur missing, derive from ask or round default
  - If budget_fit/_score missing but investor has funds, approximate from ticket range overlap

  Usage: npm run opps:enrich
*/
import prisma from "../src/infrastructure/persistence/prisma/client";

type RoundEnum = 'PRE_SEED'|'SEED'|'A'|'B'|'C'|'GROWTH'|null;

function mapRoundStr(r?: string | null): RoundEnum {
  if (!r) return null;
  const s = r.toLowerCase();
  if (s.includes('pre')) return 'PRE_SEED';
  if (s.startsWith('seed')) return 'SEED';
  if (s === 'a' || s.includes('series a')) return 'A';
  if (s === 'b' || s.includes('series b')) return 'B';
  if (s === 'c' || s.includes('series c')) return 'C';
  if (s.includes('growth') || s.includes('late')) return 'GROWTH';
  return null;
}

function defaultAmountForRound(r: RoundEnum): number | null {
  switch (r) {
    case 'PRE_SEED': return 200_000;
    case 'SEED': return 800_000;
    case 'A': return 3_000_000;
    case 'B': return 8_000_000;
    case 'C': return 20_000_000;
    case 'GROWTH': return 50_000_000;
    default: return null;
  }
}

function dealForRound(r: RoundEnum): 'EQUITY'|'CONVERTIBLE'|'SAFE'|'GRANT'|'REVENUE_BASED'|'PARTNERSHIP'|'PILOT'|'LICENSE'|'COMMERCIAL'|null {
  switch (r) {
    case 'PRE_SEED': return 'SAFE';
    case 'SEED': return 'EQUITY';
    case 'A': return 'EQUITY';
    case 'B': return 'EQUITY';
    case 'C': return 'EQUITY';
    case 'GROWTH': return 'EQUITY';
    default: return null;
  }
}

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await prisma.$queryRawUnsafe<Array<any>>(`
    SELECT o.*, s.ask_min_eur, s.ask_max_eur, s.round as s_round
    FROM "OPPORTUNITY" o
    LEFT JOIN "S_STARTUP" s ON (o.target_type = 'STARTUP' AND o.target_id = s.id)
    WHERE o.direction = 'I_TO_S'
      AND (o.round IS NULL OR o.deal_type IS NULL OR o.proposed_amount_eur IS NULL OR o.budget_fit IS NULL);
  `);

  let updated = 0;
  for (const r of rows) {
    const sMin = r.ask_min_eur != null ? Number(r.ask_min_eur) : null;
    const sMax = r.ask_max_eur != null ? Number(r.ask_max_eur) : null;
    let round: RoundEnum = r.round ?? null;
    if (!round) round = mapRoundStr(r.s_round ?? null);
    if (!round && (sMin != null || sMax != null)) {
      const mid = (sMin != null && sMax != null) ? (sMin + sMax) / 2 : (sMax ?? sMin ?? 0);
      if (mid < 400_000) round = 'PRE_SEED';
      else if (mid < 1_500_000) round = 'SEED';
      else if (mid < 5_000_000) round = 'A';
      else if (mid < 12_000_000) round = 'B';
      else if (mid < 30_000_000) round = 'C';
      else round = 'GROWTH';
    }
    const deal = r.deal_type ?? dealForRound(round);
    let prop: number | null = r.proposed_amount_eur != null ? Number(r.proposed_amount_eur) : null;
    if (prop == null) {
      if (sMin != null && sMax != null) prop = (sMin + sMax) / 2;
      else if (sMax != null) prop = sMax;
      else if (sMin != null) prop = sMin;
      else prop = defaultAmountForRound(round);
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "OPPORTUNITY" SET
         round = COALESCE($2::"Round", round),
         deal_type = COALESCE($3::"DealType", deal_type),
         proposed_amount_eur = COALESCE($4, proposed_amount_eur),
         updated_at = NOW()
       WHERE id = $1;`,
      r.id,
      round,
      deal,
      prop
    );
    updated++;
  }
  console.log(`Enriched opportunities: ${updated}`);
}

main().catch(e => { console.error(e); process.exit(1); });
