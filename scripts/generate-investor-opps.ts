/*
  Utility script: list existing opportunities for an investor, generate if needed, then list again.
  Usage:
    DATABASE_URL must be set.
    npm run gen:investor-opps -- 18
*/
import { OpportunityRepositoryPrisma } from "../src/infrastructure/persistence/prisma/OpportunityRepositoryPrisma";
import { StartupRepositoryPrisma } from "../src/infrastructure/persistence/prisma/StartupRepositoryPrisma";
import { InvestorRepositoryPrisma } from "../src/infrastructure/persistence/prisma/InvestorRepositoryPrisma";
import { PartnerRepositoryPrisma } from "../src/infrastructure/persistence/prisma/PartnerRepositoryPrisma";
import { OpportunityReadRepositoryPrisma } from "../src/infrastructure/persistence/prisma/OpportunityReadRepositoryPrisma";
import { InvestmentFundRepositoryPrisma } from "../src/infrastructure/persistence/prisma/InvestmentFundRepositoryPrisma";
import { ScoringService } from "../src/application/services/opportunities/ScoringService";
import { EntityType } from "../src/domain/enums/Opportunities";

async function main() {
  const arg = process.env.INVESTOR_ID || process.argv.slice(2).find((a) => /^(\d+)$/.test(a) ?? false) || '';
  const investorId = Number(arg);
  if (!Number.isFinite(investorId) || investorId <= 0) {
    console.log("Usage: npm run gen:investor-opps -- <INVESTOR_ID>");
    console.log("Or: INVESTOR_ID=18 npm run gen:investor-opps");
    process.exit(1);
  }

  const oppRepo = new OpportunityRepositoryPrisma();
  const scoring = new ScoringService(
    oppRepo,
    new StartupRepositoryPrisma(),
    new InvestorRepositoryPrisma(),
    new PartnerRepositoryPrisma(),
    new OpportunityReadRepositoryPrisma(),
    new InvestmentFundRepositoryPrisma(),
  );

  console.log(`Checking opportunities for investor #${investorId}...`);
  const invRepo = new InvestorRepositoryPrisma();
  const readRepo = new OpportunityReadRepositoryPrisma();
  const inv = await invRepo.getById(investorId);
  const startups = await readRepo.getStartupsForScoring();
  console.log(`Investor loaded: ${inv ? inv.name : 'NOT FOUND'}`);
  console.log(`Startups available for scoring: ${startups.length}`);

  const before = await oppRepo.listForEntity('INVESTOR' as EntityType, investorId, 1, 100);
  console.log(`Existing opportunities for investor #${investorId}: ${before.total}`);
  const force = process.env.FORCE === '1' || process.argv.includes('force') || process.argv.includes('--force');
  const topKArg = Number(process.env.TOPK || process.argv.find(a => a.startsWith('topK='))?.split('=')[1] || 20);
  const minScoreArg = Number(process.env.MINSCORE || process.argv.find(a => a.startsWith('minScore='))?.split('=')[1] || 45);
  if (force || before.total === 0 || before.total < (Number.isFinite(topKArg) ? topKArg : 20)) {
    const res = await scoring.generateForInvestor(
      investorId,
      Number.isFinite(topKArg) ? topKArg : 20,
      Number.isFinite(minScoreArg) ? minScoreArg : 45
    );
    console.log(`Generated ${res.created} opportunities.`);
    if (res.created === 0 && (minScoreArg ?? 45) > 0) {
      console.log("No opportunities created at chosen threshold; retrying with minScore=0 and topK=20...");
      const res2 = await scoring.generateForInvestor(investorId, 20, 0);
      console.log(`Generated ${res2.created} opportunities (fallback).`);
    }
  } else {
    console.log("Skipping generation (use 'force' or FORCE=1 to regenerate/update enrichment).");
  }
  const after = await oppRepo.listForEntity('INVESTOR' as EntityType, investorId, 1, 100);
  console.log(`Now opportunities for investor #${investorId}: ${after.total}`);
  if (after.items.length) {
    const sample = after.items.slice(0, 5).map((o) => ({ id: o.id, score: o.score, status: o.status, dir: o.direction, src: `${o.source_type}#${o.source_id}`, tgt: `${o.target_type}#${o.target_id}` }));
    console.table(sample);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
