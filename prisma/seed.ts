/*
  Prisma seed script: populates base data (startups, investors, partners, funds)
  then generates opportunities using the existing ScoringService.
*/

import { PrismaClient } from '@prisma/client';
import { ScoringService } from '../src/application/services/opportunities/ScoringService';
import { OpportunityRepositoryPrisma } from '../src/infrastructure/persistence/prisma/OpportunityRepositoryPrisma';
import { StartupRepositoryPrisma } from '../src/infrastructure/persistence/prisma/StartupRepositoryPrisma';
import { InvestorRepositoryPrisma } from '../src/infrastructure/persistence/prisma/InvestorRepositoryPrisma';
import { PartnerRepositoryPrisma } from '../src/infrastructure/persistence/prisma/PartnerRepositoryPrisma';
import { OpportunityReadRepositoryPrisma } from '../src/infrastructure/persistence/prisma/OpportunityReadRepositoryPrisma';
import { InvestmentFundRepositoryPrisma } from '../src/infrastructure/persistence/prisma/InvestmentFundRepositoryPrisma';

const prisma = new PrismaClient();

async function upsertInvestor(params: {
  email: string;
  name: string;
  legal_status?: string;
  address?: string;
  phone?: string;
  description?: string;
  investor_type?: string;
  investment_focus?: string;
  funds?: Array<{
    name: string;
    vintage?: number;
    aum_eur?: number;
    dry_powder_eur?: number;
    ticket_min_eur?: number;
    ticket_max_eur?: number;
    sector_focus?: string[];
    geo_focus?: string[];
    stage_focus?: string[];
  }>;
}) {
  const existing = await prisma.s_INVESTOR.findUnique({ where: { email: params.email } });
  const investor = existing
    ? await prisma.s_INVESTOR.update({
        where: { email: params.email },
        data: {
          name: params.name,
          legal_status: params.legal_status ?? existing.legal_status,
          address: params.address ?? existing.address,
          phone: params.phone ?? existing.phone,
          description: params.description ?? existing.description,
          investor_type: params.investor_type ?? existing.investor_type ?? null,
          investment_focus: params.investment_focus ?? existing.investment_focus ?? null,
        },
      })
    : await prisma.s_INVESTOR.create({
        data: {
          name: params.name,
          legal_status: params.legal_status || 'SAS',
          address: params.address || 'Paris, France',
          email: params.email,
          phone: params.phone || '+33 1 23 45 67 89',
          description: params.description || 'Investor',
          investor_type: params.investor_type || 'VC',
          investment_focus: params.investment_focus || 'seed, series a, SaaS, AI, fintech',
        },
      });

  // Reset funds for idempotency
  if (params.funds) {
    await prisma.iNVESTMENT_FUND.deleteMany({ where: { investor_id: investor.id } });
    for (const f of params.funds) {
      await prisma.iNVESTMENT_FUND.create({
        data: {
          investor_id: investor.id,
          name: f.name,
          vintage: f.vintage ?? null,
          aum_eur: f.aum_eur ?? null,
          dry_powder_eur: f.dry_powder_eur ?? null,
          ticket_min_eur: f.ticket_min_eur ?? null,
          ticket_max_eur: f.ticket_max_eur ?? null,
          sector_focus: f.sector_focus ?? ['SaaS', 'AI'],
          geo_focus: f.geo_focus ?? ['France', 'Belgium'],
          stage_focus: f.stage_focus ?? ['seed', 'series a'],
        },
      });
    }
  }
}

async function upsertPartner(params: {
  email: string;
  name: string;
  legal_status?: string;
  address?: string;
  phone?: string;
  description?: string;
  partnership_type?: string;
  program_names?: string[];
  pilot_budget_min_eur?: number | null;
  pilot_budget_max_eur?: number | null;
}) {
  const existing = await prisma.s_PARTNER.findUnique({ where: { email: params.email } });
  if (existing) {
    await prisma.s_PARTNER.update({
      where: { email: params.email },
      data: {
        name: params.name,
        legal_status: params.legal_status ?? existing.legal_status,
        address: params.address ?? existing.address,
        phone: params.phone ?? existing.phone,
        description: params.description ?? existing.description,
        partnership_type: params.partnership_type ?? existing.partnership_type,
        program_names: params.program_names ?? existing.program_names,
        pilot_budget_min_eur: params.pilot_budget_min_eur ?? existing.pilot_budget_min_eur,
        pilot_budget_max_eur: params.pilot_budget_max_eur ?? existing.pilot_budget_max_eur,
      },
    });
  } else {
    await prisma.s_PARTNER.create({
      data: {
        name: params.name,
        legal_status: params.legal_status || 'SAS',
        address: params.address || 'Lyon, France',
        email: params.email,
        phone: params.phone || '+33 4 56 78 90 12',
        description: params.description || 'Corporate / Partner',
        partnership_type: params.partnership_type || 'distribution',
        program_names: params.program_names || ['Startup Program'],
        pilot_budget_min_eur: params.pilot_budget_min_eur ?? 50000,
        pilot_budget_max_eur: params.pilot_budget_max_eur ?? 200000,
      },
    });
  }
}

async function upsertStartup(params: {
  name: string;
  email: string;
  legal_status?: string;
  address?: string;
  phone?: string;
  sector?: string;
  maturity?: string;
  description?: string;
  details?: { needs?: string | null; website_url?: string | null };
  ask_min_eur?: number | null;
  ask_max_eur?: number | null;
  round?: string | null;
}) {
  // No unique key on startup; use name+email heuristic
  const existing = await prisma.s_STARTUP.findFirst({ where: { name: params.name, email: params.email } });
  const s = existing
    ? await prisma.s_STARTUP.update({
        where: { id: existing.id },
        data: {
          legal_status: params.legal_status ?? existing.legal_status,
          address: params.address ?? existing.address,
          phone: params.phone ?? existing.phone,
          sector: params.sector ?? existing.sector,
          maturity: params.maturity ?? existing.maturity,
          description: params.description ?? existing.description,
          ask_min_eur: params.ask_min_eur ?? existing.ask_min_eur,
          ask_max_eur: params.ask_max_eur ?? existing.ask_max_eur,
          round: params.round ?? existing.round,
        },
      })
    : await prisma.s_STARTUP.create({
        data: {
          name: params.name,
          email: params.email,
          legal_status: params.legal_status || 'SAS',
          address: params.address || 'Paris, France',
          phone: params.phone || '+33 6 12 34 56 78',
          sector: params.sector || 'SaaS',
          maturity: params.maturity || 'early',
          description: params.description || 'We build something great with AI.',
          ask_min_eur: params.ask_min_eur ?? 250000,
          ask_max_eur: params.ask_max_eur ?? 1000000,
          round: params.round ?? 'seed',
        },
      });

  // Details
  await prisma.s_STARTUP_DETAIL.upsert({
    where: { id: (await prisma.s_STARTUP_DETAIL.findFirst({ where: { startup_id: s.id } }))?.id ?? 0 },
    create: {
      startup_id: s.id,
      description: params.description || 'We build something great with AI.',
      website_url: params.details?.website_url ?? 'https://example.com',
      needs: params.details?.needs ?? 'seed, distribution, pilot, series a',
    },
    update: {
      description: params.description || 'We build something great with AI.',
      website_url: params.details?.website_url ?? 'https://example.com',
      needs: params.details?.needs ?? 'seed, distribution, pilot, series a',
    },
  });

  return s.id;
}

async function main() {
  console.log('Seeding base data...');
  // Investors with funds
  await upsertInvestor({
    email: 'investor.alpha@example.com',
    name: 'Alpha Capital',
    address: 'Paris, France',
    investment_focus: 'seed, series a, AI, SaaS',
    funds: [
      { name: 'Alpha Seed I', vintage: 2022, aum_eur: 50000000, dry_powder_eur: 20000000, ticket_min_eur: 200000, ticket_max_eur: 1000000, stage_focus: ['seed'] },
      { name: 'Alpha Growth', vintage: 2024, aum_eur: 150000000, dry_powder_eur: 90000000, ticket_min_eur: 1000000, ticket_max_eur: 5000000, stage_focus: ['series a','series b'] },
    ],
  });
  await upsertInvestor({
    email: 'investor.beta@example.com',
    name: 'Beta Ventures',
    address: 'Brussels, Belgium',
    investment_focus: 'seed, fintech, marketplace',
    funds: [
      { name: 'Beta Seed', vintage: 2021, aum_eur: 30000000, dry_powder_eur: 10000000, ticket_min_eur: 150000, ticket_max_eur: 800000, stage_focus: ['seed'] },
    ],
  });
  await upsertInvestor({
    email: 'investor.gamma@example.com',
    name: 'Gamma Partners',
    address: 'Lausanne, Switzerland',
    investment_focus: 'deeptech, seed, series a',
    funds: [
      { name: 'Gamma Deep I', vintage: 2020, aum_eur: 80000000, dry_powder_eur: 15000000, ticket_min_eur: 500000, ticket_max_eur: 2000000, stage_focus: ['seed','series a'] },
    ],
  });

  // Partners
  await upsertPartner({
    email: 'partner.corp@example.com',
    name: 'CorpX',
    address: 'Lyon, France',
    partnership_type: 'distribution',
    program_names: ['CorpX Accelerator'],
  });
  await upsertPartner({
    email: 'partner.telco@example.com',
    name: 'TelcoY',
    address: 'Paris, France',
    partnership_type: 'integration',
    program_names: ['TelcoY Ventures'],
  });

  // Startups
  const startupIds: number[] = [];
  startupIds.push(await upsertStartup({ name: 'SaaSify', email: 'team@saasify.io', sector: 'SaaS', maturity: 'mvp', details: { needs: 'seed, distribution, pilot' }, ask_min_eur: 200000, ask_max_eur: 800000, round: 'seed' }));
  startupIds.push(await upsertStartup({ name: 'FinAI', email: 'hello@finai.app', sector: 'Fintech', maturity: 'early', details: { needs: 'seed, series a, GTM' }, ask_min_eur: 500000, ask_max_eur: 1500000, round: 'seed' }));
  startupIds.push(await upsertStartup({ name: 'DeepVision', email: 'contact@deepvision.ai', sector: 'Deeptech', maturity: 'prototype', details: { needs: 'series a, industrial partnership' }, ask_min_eur: 1500000, ask_max_eur: 3000000, round: 'series a' }));
  startupIds.push(await upsertStartup({ name: 'MarketLink', email: 'hi@marketlink.io', sector: 'Marketplace', maturity: 'growth', details: { needs: 'series a, expansion' }, ask_min_eur: 1000000, ask_max_eur: 4000000, round: 'series a' }));
  startupIds.push(await upsertStartup({ name: 'HealthHub', email: 'team@healthhub.app', sector: 'Health', maturity: 'mvp', details: { needs: 'pilot, distribution' }, ask_min_eur: 300000, ask_max_eur: 900000, round: 'seed' }));

  // Generate opportunities using ScoringService
  console.log('Generating opportunities...');
  const service = new ScoringService(
    new OpportunityRepositoryPrisma(),
    new StartupRepositoryPrisma(),
    new InvestorRepositoryPrisma(),
    new PartnerRepositoryPrisma(),
    new OpportunityReadRepositoryPrisma(),
    new InvestmentFundRepositoryPrisma(),
  );

  // For each startup, generate top opportunities
  for (const id of startupIds) {
    await service.generateForStartup(id, 10, 45);
  }

  // For each investor, generate matches
  const investors = await prisma.s_INVESTOR.findMany();
  for (const inv of investors) {
    await service.generateForInvestor(inv.id, 10, 45);
  }

  // For each partner, generate matches
  const partners = await prisma.s_PARTNER.findMany();
  for (const par of partners) {
    await service.generateForPartner(par.id, 10, 45);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
