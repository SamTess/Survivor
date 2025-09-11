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

/**
 * @openapi
 * /opportunities:
 *   post:
 *     summary: Generate opportunities by matching entities
 *     description: |
 *       Generate and upsert opportunities by matching a source entity with potential targets using the scoring service.
 *       Supports generation for a Startup, an Investor, or a Partner.
 *     tags:
 *       - Opportunities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mode, id]
 *             properties:
 *               mode:
 *                 type: string
 *                 description: Generation mode
 *                 enum: [startup, investor, partner]
 *                 example: startup
 *               id:
 *                 type: integer
 *                 description: ID of the source entity (startup/investor/partner)
 *                 minimum: 1
 *                 example: 42
 *               topK:
 *                 type: integer
 *                 description: Max number of matches to create
 *                 default: 10
 *                 example: 10
 *               minScore:
 *                 type: number
 *                 description: Minimum score threshold (0-100)
 *                 default: 45
 *                 example: 60
 *     responses:
 *       200:
 *         description: Generation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: integer
 *                       description: Number of opportunities created/updated
 *                       example: 7
 *       400:
 *         description: Invalid request payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "id invalide"
 *       500:
 *         description: Server error during generation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erreur"
 */
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

/**
 * @openapi
 * /opportunities:
 *   get:
 *     summary: List opportunities
 *     description: |
 *       List opportunities by entity (type + id) or by status. Use pagination with page and limit.
 *       You can also trigger a batch generation for the latest startups using `action=batch`.
 *     tags:
 *       - Opportunities
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [batch]
 *         description: Trigger a batch generation job for latest startups
 *         example: batch
 *       - in: query
 *         name: n
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: When action=batch, number of recent startups to process
 *         example: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [STARTUP, INVESTOR, PARTNER]
 *         description: Entity type (used with id)
 *         example: STARTUP
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Entity ID to list related opportunities
 *         example: 18
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, qualified, contacted, in_discussion, pilot, deal, lost]
 *         description: Filter by opportunity status (alternative to type+id)
 *         example: qualified
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Opportunities list or batch result
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success: { type: boolean, example: true }
 *                     processed: { type: integer, example: 5 }
 *                     created: { type: integer, example: 12 }
 *                 - type: object
 *                   properties:
 *                     success: { type: boolean, example: true }
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Opportunity
 *                         properties:
 *                           id: { type: string, example: "3f0b3b9c-..." }
 *                           direction: { type: string, example: "S->I" }
 *                           source_type: { type: string, enum: [STARTUP, INVESTOR, PARTNER] }
 *                           source_id: { type: integer, example: 12 }
 *                           source_name: { type: string, nullable: true, example: "Acme Corp" }
 *                           target_type: { type: string, enum: [STARTUP, INVESTOR, PARTNER] }
 *                           target_id: { type: integer, example: 34 }
 *                           target_name: { type: string, nullable: true, example: "Seed Ventures" }
 *                           score: { type: number, nullable: true, example: 78.5 }
 *                           score_breakdown:
 *                             type: object
 *                             additionalProperties:
 *                               type: number
 *                             example: { tags: 30, text: 20, stage: 10, geo: 5, engagement: 8 }
 *                           status: { type: string, enum: [new, qualified, contacted, in_discussion, pilot, deal, lost] }
 *                           reason: { type: string, nullable: true }
 *                           next_action: { type: string, nullable: true }
 *                           owner_user_id: { type: integer, nullable: true }
 *                           deal_type: { type: string, nullable: true }
 *                           round: { type: string, nullable: true }
 *                           proposed_amount_eur: { nullable: true }
 *                           valuation_pre_money_eur: { nullable: true }
 *                           ownership_target_pct: { nullable: true }
 *                           fund_id: { type: string, nullable: true }
 *                           budget_fit: { type: string, nullable: true }
 *                           budget_fit_score: { nullable: true }
 *                           pilot_estimated_cost_eur: { nullable: true }
 *                           pilot_budget_fit: { type: string, nullable: true }
 *                           term_deadline: { type: string, format: date-time, nullable: true }
 *                           created_at: { type: string, format: date-time }
 *                           updated_at: { type: string, format: date-time }
 *                     total: { type: integer, example: 25 }
 *       400:
 *         description: Missing or invalid filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Spécifiez ?type & id ou ?status" }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Erreur" }
 */
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

/**
 * @openapi
 * /opportunities:
 *   patch:
 *     summary: Update an opportunity
 *     description: Update the status, reason, or financial fields of an existing opportunity
 *     tags:
 *       - Opportunities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: Opportunity ID
 *                 example: "3f0b3b9c-..."
 *               status:
 *                 type: string
 *                 description: New opportunity status
 *                 enum: [new, qualified, contacted, in_discussion, pilot, deal, lost]
 *                 example: qualified
 *               reason:
 *                 type: string
 *                 description: Optional reason when changing status
 *                 example: "Budget mismatch"
 *               deal_type: { type: string, nullable: true }
 *               round: { type: string, nullable: true }
 *               proposed_amount_eur: { nullable: true }
 *               valuation_pre_money_eur: { nullable: true }
 *               ownership_target_pct: { nullable: true }
 *               fund_id: { type: string, nullable: true }
 *               budget_fit: { type: string, nullable: true }
 *               budget_fit_score: { nullable: true }
 *               pilot_estimated_cost_eur: { nullable: true }
 *               pilot_budget_fit: { type: string, nullable: true }
 *               term_deadline:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Opportunity updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   description: Updated opportunity
 *       400:
 *         description: Invalid input (e.g., missing id)
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
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
