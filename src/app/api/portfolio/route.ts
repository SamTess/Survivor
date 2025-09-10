import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '../../../application/services/portfolio/PortfolioService';
import { PortfolioRepositoryPrisma } from '../../../infrastructure/persistence/prisma/PortfolioRepositoryPrisma';

const service = new PortfolioService(new PortfolioRepositoryPrisma());

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const investorId = Number(searchParams.get('investorId'));
    const months = searchParams.get('months') ? Number(searchParams.get('months')) : undefined;
    if (!investorId || investorId <= 0) {
      return NextResponse.json({ success: false, error: 'investorId invalide' }, { status: 400 });
    }
    const data = await service.getInvestorPortfolio(investorId, months);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
