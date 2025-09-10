import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '../../../application/services/portfolio/PortfolioService';
import { PortfolioRepositoryPrisma } from '../../../infrastructure/persistence/prisma/PortfolioRepositoryPrisma';

const service = new PortfolioService(new PortfolioRepositoryPrisma());

/**
 * @openapi
 * /portfolio:
 *   get:
 *     summary: Get investor portfolio overview
 *     description: Retrieve an investor's portfolio KPIs, holdings, sector distribution and performance over time
 *     tags:
 *       - Portfolio
 *     parameters:
 *       - in: query
 *         name: investorId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Investor ID
 *         example: 18
 *       - in: query
 *         name: months
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Optional number of months for performance window
 *         example: 12
 *     responses:
 *       200:
 *         description: Portfolio data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalInvestments: { type: number, example: 12 }
 *                         totalValue: { type: number, example: 12500000 }
 *                         activeInvestments: { type: number, example: 10 }
 *                         averageReturn: { type: number, example: 23.5 }
 *                         bestPerformer: { type: string, example: "Acme AI" }
 *                         worstPerformer: { type: string, example: "Beta Health" }
 *                         totalROI: { type: number, example: 45.2 }
 *                         monthlyReturn: { type: number, example: 2.1 }
 *                     investments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string, example: "deal_123" }
 *                           startupId: { type: integer, example: 42 }
 *                           startupName: { type: string, example: "Acme AI" }
 *                           amount: { type: number, example: 500000 }
 *                           currentValue: { type: number, example: 800000 }
 *                           returnRate: { type: number, example: 60.0 }
 *                           sector: { type: string, example: "AI" }
 *                           investmentDate: { type: string, format: date, example: "2024-04-10" }
 *                           status: { type: string, enum: [active, exited, at_risk], example: active }
 *                           maturity: { type: string, example: "SEED" }
 *                     sectorDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sector: { type: string, example: "AI" }
 *                           amount: { type: number, example: 2500000 }
 *                           percentage: { type: number, example: 20.0 }
 *                           count: { type: number, example: 4 }
 *                     performance:
 *                       type: object
 *                       properties:
 *                         monthlyReturns:
 *                           type: array
 *                           items: { type: number }
 *                         benchmarkReturns:
 *                           type: array
 *                           items: { type: number }
 *       400:
 *         description: Missing or invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "investorId invalide" }
 *       500:
 *         description: Server error
 */
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
