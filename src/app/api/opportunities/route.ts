import { NextRequest, NextResponse } from 'next/server';
import { OpportunityRepositoryPrisma } from '../../../infrastructure/persistence/prisma/OpportunityRepositoryPrisma';
import { StartupRepositoryPrisma } from '../../../infrastructure/persistence/prisma/StartupRepositoryPrisma';
import { InvestorRepositoryPrisma } from '../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';
import { PartnerRepositoryPrisma } from '../../../infrastructure/persistence/prisma/PartnerRepositoryPrisma';
import { ScoringService } from '../../../application/services/opportunities/ScoringService';
import { OpportunityReadRepositoryPrisma } from '../../../infrastructure/persistence/prisma/OpportunityReadRepositoryPrisma';
import { EntityType, OpportunityStatus } from '../../../domain/enums/Opportunities';

const opportunityRepo = new OpportunityRepositoryPrisma();
const scoringService = new ScoringService(
  opportunityRepo,
  new StartupRepositoryPrisma(),
  new InvestorRepositoryPrisma(),
  new PartnerRepositoryPrisma(),
  new OpportunityReadRepositoryPrisma(),
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
  const startupId = Number(body.startupId);
    if (!Number.isInteger(startupId) || startupId <= 0) {
      return NextResponse.json({ success: false, error: 'startupId invalide' }, { status: 400 });
    }
    const topK = body.topK ? Number(body.topK) : 10;
    const minScore = body.minScore ? Number(body.minScore) : 45;
    const res = await scoringService.generateForStartup(startupId, topK, minScore);
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

  try {
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
    const status = String(body.status || '') as OpportunityStatus;
    const reason = body.reason ?? null;
    if (!id || !status) return NextResponse.json({ success: false, error: 'id et status requis' }, { status: 400 });
    const updated = await opportunityRepo.updateStatus(id, status, reason);
    if (!updated) return NextResponse.json({ success: false, error: 'Opportunity introuvable' }, { status: 404 });
    await opportunityRepo.logEvent({ opportunity_id: updated.id, type: 'status_changed', payload: { status, reason } });
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
