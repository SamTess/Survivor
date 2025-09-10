import { NextRequest, NextResponse } from 'next/server';
import { OpportunityRepositoryPrisma } from '../../../infrastructure/persistence/prisma/OpportunityRepositoryPrisma';
import { StartupRepositoryPrisma } from '../../../infrastructure/persistence/prisma/StartupRepositoryPrisma';
import { InvestorRepositoryPrisma } from '../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';
import { PartnerRepositoryPrisma } from '../../../infrastructure/persistence/prisma/PartnerRepositoryPrisma';
import { ScoringService } from '../../../application/services/opportunities/ScoringService';
import { OpportunityReadRepositoryPrisma } from '../../../infrastructure/persistence/prisma/OpportunityReadRepositoryPrisma';
import { EntityType, OpportunityStatus } from '../../../domain/enums/Opportunities';
import { InvestmentFundRepositoryPrisma } from '../../../infrastructure/persistence/prisma/InvestmentFundRepositoryPrisma';

const opportunityRepo = new OpportunityRepositoryPrisma();
const scoringService = new ScoringService(
  opportunityRepo,
  new StartupRepositoryPrisma(),
  new InvestorRepositoryPrisma(),
  new PartnerRepositoryPrisma(),
  new OpportunityReadRepositoryPrisma(),
  new InvestmentFundRepositoryPrisma(),
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mode = String(body.mode || 'startup'); // 'startup' | 'investor' | 'partner'
    const id = Number(body.id);
    const topK = body.topK ? Number(body.topK) : 10;
    const minScore = body.minScore ? Number(body.minScore) : 45;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ success: false, error: 'id invalide' }, { status: 400 });
    }

    let res: unknown;
    if (mode === 'startup') {
      res = await scoringService.generateForStartup(id, topK, minScore);
    } else if (mode === 'investor') {
      res = await scoringService.generateForInvestor(id, topK, minScore);
    } else if (mode === 'partner') {
      res = await scoringService.generateForPartner(id, topK, minScore);
    } else {
      return NextResponse.json({ success: false, error: 'mode invalide' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: res });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as EntityType | null; // STARTUP|INVESTOR|PARTNER
  const id = searchParams.get('id');
  const status = searchParams.get('status') as OpportunityStatus | null;
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '10');
  const action = searchParams.get('action');

  try {
    if (action === 'batch') {
      const n = Number(searchParams.get('n') || '10');
      const startups = await new StartupRepositoryPrisma().getAll();
      const latest = startups.slice(0, n);
      let totalCreated = 0;
      for (const s of latest) {
        const res = await scoringService.generateForStartup(s.id, 10, 45);
        totalCreated += res.created;
      }
      return NextResponse.json({ success: true, processed: latest.length, created: totalCreated });
    }
    if (type && id) {
      const res = await opportunityRepo.listForEntity(type, Number(id), page, limit);
      return NextResponse.json({ success: true, ...res });
    }
    if (status) {
      const res = await opportunityRepo.listByStatus(status, page, limit);
      return NextResponse.json({ success: true, ...res });
    }
    return NextResponse.json({ success: false, error: 'Spécifiez ?type & id ou ?status' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = String(body.id || '');
    if (!id) return NextResponse.json({ success: false, error: 'id requis' }, { status: 400 });
    if (body.status) {
      const status = String(body.status) as OpportunityStatus;
      const reason = body.reason ?? null;
      const updated = await opportunityRepo.updateStatus(id, status, reason);
      if (!updated) return NextResponse.json({ success: false, error: 'Opportunity introuvable' }, { status: 404 });
      await opportunityRepo.logEvent({ opportunity_id: updated.id, type: 'status_changed', payload: { status, reason } });
      return NextResponse.json({ success: true, data: updated });
    }
    const updated = await opportunityRepo.updateFields(id, {
      deal_type: body.deal_type,
      round: body.round,
      proposed_amount_eur: body.proposed_amount_eur,
      valuation_pre_money_eur: body.valuation_pre_money_eur,
      ownership_target_pct: body.ownership_target_pct,
      fund_id: body.fund_id,
      budget_fit: body.budget_fit,
      budget_fit_score: body.budget_fit_score,
      pilot_estimated_cost_eur: body.pilot_estimated_cost_eur,
      pilot_budget_fit: body.pilot_budget_fit,
      term_deadline: body.term_deadline ? new Date(body.term_deadline) : undefined,
    });
    if (!updated) return NextResponse.json({ success: false, error: 'Opportunity introuvable' }, { status: 404 });
    await opportunityRepo.logEvent({ opportunity_id: updated.id, type: 'rescored', payload: { action: 'partial_update' } });
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
