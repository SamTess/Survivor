/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "./client";
import { randomUUID } from "crypto";
import { OpportunityRepository } from "../../../domain/repositories/OpportunityRepository";
import { Opportunity, OpportunityEvent } from "../../../domain/entities/Opportunity";
import { EntityType, OpportunityStatus } from "../../../domain/enums/Opportunities";

export class OpportunityRepositoryPrisma implements OpportunityRepository {
  private get delegate(): any | null {
    const anyPrisma = prisma as unknown as Record<string, unknown>;
    return (anyPrisma && (anyPrisma as any).oPPORTUNITY) ? (anyPrisma as any).oPPORTUNITY : null;
  }

  private mapRow(o: Record<string, unknown>): Opportunity {
    return this.map(o);
  }

  private map(o: Record<string, unknown>): Opportunity {
    return {
      id: o.id as string,
      direction: this.mapDirectionToDomain(o.direction as string),
      source_type: this.mapEntityToDomain(o.source_type as string),
      source_id: o.source_id as number,
      source_name: (o as Record<string, unknown>).source_name as string | undefined,
      target_type: this.mapEntityToDomain(o.target_type as string),
      target_id: o.target_id as number,
      target_name: (o as Record<string, unknown>).target_name as string | undefined,
      score: (o.score !== null && o.score !== undefined) ? Number(o.score as any) : null,
      score_breakdown: (o.score_breakdown as Record<string, number>) || null,
      status: this.mapStatusToDomain(o.status as string),
      reason: (o.reason as string) ?? null,
      next_action: (o.next_action as string) ?? null,
      owner_user_id: (o.owner_user_id as number) ?? null,
      deal_type: (o as Record<string, unknown>).deal_type as string | undefined,
      round: (o as Record<string, unknown>).round as string | undefined,
      proposed_amount_eur: (o as Record<string, unknown>).proposed_amount_eur,
      valuation_pre_money_eur: (o as Record<string, unknown>).valuation_pre_money_eur,
      ownership_target_pct: (o as Record<string, unknown>).ownership_target_pct,
      fund_id: (o as Record<string, unknown>).fund_id as string | undefined,
      budget_fit: (o as Record<string, unknown>).budget_fit as string | undefined,
      budget_fit_score: (o as Record<string, unknown>).budget_fit_score,
      pilot_estimated_cost_eur: (o as Record<string, unknown>).pilot_estimated_cost_eur,
      pilot_budget_fit: (o as Record<string, unknown>).pilot_budget_fit as string | undefined,
      term_deadline: (o as Record<string, unknown>).term_deadline as Date | undefined,
      startup_investment_history: (o as Record<string, unknown>).startup_investment_history as Array<{ dt: string | Date; amount_eur: unknown; round?: string | null; deal_type?: string | null; }> | undefined,
      created_at: o.created_at as Date,
      updated_at: o.updated_at as Date,
    };
  }

  async upsertUnique(op: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Opportunity> {
    const d = this.delegate;
    if (!d) {
      const sql = `
        INSERT INTO "OPPORTUNITY" (id, direction, source_type, source_id, target_type, target_id, score, score_breakdown, status, reason, next_action, owner_user_id, deal_type, round, proposed_amount_eur, valuation_pre_money_eur, ownership_target_pct, fund_id, budget_fit, budget_fit_score, pilot_estimated_cost_eur, pilot_budget_fit, term_deadline, created_at, updated_at)
        VALUES (
          $1, $2::"OpportunityDirection", $3::"EntityType", $4, $5::"EntityType", $6,
          $7, $8::jsonb, $9::"OpportunityStatus", $10, $11, $12,
          $13::"DealType", $14::"Round", $15, $16, $17, $18, $19::"BudgetFit", $20, $21, $22::"PilotBudgetFit", $23,
          NOW(), NOW()
        )
        ON CONFLICT (direction, source_type, source_id, target_type, target_id)
        DO UPDATE SET
          score = EXCLUDED.score,
          score_breakdown = EXCLUDED.score_breakdown,
          status = EXCLUDED.status,
          reason = EXCLUDED.reason,
          next_action = EXCLUDED.next_action,
          owner_user_id = EXCLUDED.owner_user_id,
          deal_type = EXCLUDED.deal_type,
          round = EXCLUDED.round,
          proposed_amount_eur = EXCLUDED.proposed_amount_eur,
          valuation_pre_money_eur = EXCLUDED.valuation_pre_money_eur,
          ownership_target_pct = EXCLUDED.ownership_target_pct,
          fund_id = EXCLUDED.fund_id,
          budget_fit = EXCLUDED.budget_fit,
          budget_fit_score = EXCLUDED.budget_fit_score,
          pilot_estimated_cost_eur = EXCLUDED.pilot_estimated_cost_eur,
          pilot_budget_fit = EXCLUDED.pilot_budget_fit,
          term_deadline = EXCLUDED.term_deadline,
          updated_at = NOW()
        RETURNING *;`;
      const createdRows = await (prisma as unknown as { $queryRawUnsafe: (...args: any[]) => Promise<unknown> }).$queryRawUnsafe(
        sql,
        (op as any).id ?? randomUUID(),
        this.mapDirectionToPrisma(op.direction),
        this.mapEntityToPrisma(op.source_type),
        op.source_id,
        this.mapEntityToPrisma(op.target_type),
        op.target_id,
        op.score ?? null,
        op.score_breakdown ? JSON.stringify(op.score_breakdown) : null,
        this.mapStatusToPrisma(op.status),
        op.reason ?? null,
        op.next_action ?? null,
        op.owner_user_id ?? null,
        (op as any).deal_type ?? null,
        (op as any).round ?? null,
        (op as any).proposed_amount_eur ?? null,
        (op as any).valuation_pre_money_eur ?? null,
        (op as any).ownership_target_pct ?? null,
        (op as any).fund_id ?? null,
        (op as any).budget_fit ?? null,
        (op as any).budget_fit_score ?? null,
        (op as any).pilot_estimated_cost_eur ?? null,
        (op as any).pilot_budget_fit ?? null,
        (op as any).term_deadline ?? null,
      );
      return this.mapRow((createdRows as any[])[0] as Record<string, unknown>);
    }
    const created = await d.upsert({
      where: {
        direction_source_type_source_id_target_type_target_id: {
          direction: this.mapDirectionToPrisma(op.direction),
          source_type: this.mapEntityToPrisma(op.source_type),
          source_id: op.source_id,
          target_type: this.mapEntityToPrisma(op.target_type),
          target_id: op.target_id,
        }
      },
      create: {
        direction: this.mapDirectionToPrisma(op.direction),
        source_type: this.mapEntityToPrisma(op.source_type),
        source_id: op.source_id,
        target_type: this.mapEntityToPrisma(op.target_type),
        target_id: op.target_id,
        score: op.score ?? null,
        score_breakdown: op.score_breakdown as unknown as object | undefined,
        status: this.mapStatusToPrisma(op.status),
        reason: op.reason ?? null,
        next_action: op.next_action ?? null,
        owner_user_id: op.owner_user_id ?? null,
        deal_type: (op as any).deal_type ?? null,
        round: (op as any).round ?? null,
        proposed_amount_eur: (op as any).proposed_amount_eur ?? null,
        valuation_pre_money_eur: (op as any).valuation_pre_money_eur ?? null,
        ownership_target_pct: (op as any).ownership_target_pct ?? null,
        fund_id: (op as any).fund_id ?? null,
        budget_fit: (op as any).budget_fit ?? null,
        budget_fit_score: (op as any).budget_fit_score ?? null,
        pilot_estimated_cost_eur: (op as any).pilot_estimated_cost_eur ?? null,
        pilot_budget_fit: (op as any).pilot_budget_fit ?? null,
        term_deadline: (op as any).term_deadline ?? null,
      },
      update: {
        score: op.score ?? null,
        score_breakdown: op.score_breakdown as unknown as object | undefined,
        status: this.mapStatusToPrisma(op.status),
        reason: op.reason ?? null,
        next_action: op.next_action ?? null,
        owner_user_id: op.owner_user_id ?? null,
        deal_type: (op as any).deal_type ?? null,
        round: (op as any).round ?? null,
        proposed_amount_eur: (op as any).proposed_amount_eur ?? null,
        valuation_pre_money_eur: (op as any).valuation_pre_money_eur ?? null,
        ownership_target_pct: (op as any).ownership_target_pct ?? null,
        fund_id: (op as any).fund_id ?? null,
        budget_fit: (op as any).budget_fit ?? null,
        budget_fit_score: (op as any).budget_fit_score ?? null,
        pilot_estimated_cost_eur: (op as any).pilot_estimated_cost_eur ?? null,
        pilot_budget_fit: (op as any).pilot_budget_fit ?? null,
        term_deadline: (op as any).term_deadline ?? null,
      },
    });
    return this.map(created);
  }

  async getById(id: string): Promise<Opportunity | null> {
    const d = this.delegate;
    if (!d) {
      const rows = await (prisma as any).$queryRawUnsafe(`SELECT * FROM "OPPORTUNITY" WHERE id = $1 LIMIT 1;`, id);
      const r = (rows as any[])[0];
      return r ? this.mapRow(r as Record<string, unknown>) : null;
    }
    const res = await d.findUnique({ where: { id } });
    return res ? this.map(res) : null;
  }

  async listByStatus(status: OpportunityStatus, page: number, limit: number): Promise<{ items: Opportunity[]; total: number; }> {
    const offset = (page - 1) * limit;
    const rows = await (prisma as any).$queryRawUnsafe(
      `SELECT o.*,
         CASE o.source_type
           WHEN 'STARTUP' THEN (SELECT name FROM "S_STARTUP" WHERE id = o.source_id)
           WHEN 'INVESTOR' THEN (SELECT name FROM "S_INVESTOR" WHERE id = o.source_id)
           WHEN 'PARTNER' THEN (SELECT name FROM "S_PARTNER" WHERE id = o.source_id)
         END AS source_name,
         CASE o.target_type
           WHEN 'STARTUP' THEN (SELECT name FROM "S_STARTUP" WHERE id = o.target_id)
           WHEN 'INVESTOR' THEN (SELECT name FROM "S_INVESTOR" WHERE id = o.target_id)
           WHEN 'PARTNER' THEN (SELECT name FROM "S_PARTNER" WHERE id = o.target_id)
         END AS target_name
       FROM "OPPORTUNITY" o
       WHERE o.status = $1::"OpportunityStatus"
       ORDER BY o.updated_at DESC OFFSET $2 LIMIT $3;`,
      this.mapStatusToPrisma(status), offset, limit
    );
    const countRows = await (prisma as any).$queryRawUnsafe(
      `SELECT COUNT(*)::bigint AS count FROM "OPPORTUNITY" WHERE status = $1::"OpportunityStatus";`,
      this.mapStatusToPrisma(status)
    );
    const total = Number((countRows as any[])[0]?.count ?? 0);
    return { items: (rows as any[]).map((r) => this.mapRow(r as Record<string, unknown>)), total };
  }

  async listForEntity(entityType: EntityType, entityId: number, page: number, limit: number): Promise<{ items: Opportunity[]; total: number; }> {
    const sourceType = this.mapEntityToPrisma(entityType);
    const offset = (page - 1) * limit;
    const rows = await (prisma as any).$queryRawUnsafe(
      `SELECT o.*,
         CASE o.source_type
           WHEN 'STARTUP' THEN (SELECT name FROM "S_STARTUP" WHERE id = o.source_id)
           WHEN 'INVESTOR' THEN (SELECT name FROM "S_INVESTOR" WHERE id = o.source_id)
           WHEN 'PARTNER' THEN (SELECT name FROM "S_PARTNER" WHERE id = o.source_id)
         END AS source_name,
         CASE o.target_type
           WHEN 'STARTUP' THEN (SELECT name FROM "S_STARTUP" WHERE id = o.target_id)
           WHEN 'INVESTOR' THEN (SELECT name FROM "S_INVESTOR" WHERE id = o.target_id)
           WHEN 'PARTNER' THEN (SELECT name FROM "S_PARTNER" WHERE id = o.target_id)
         END AS target_name,
         (
           SELECT COALESCE(json_agg(x ORDER BY x.dt), '[]'::json)
           FROM (
             SELECT oo.updated_at AS dt,
                    (oo.proposed_amount_eur)::numeric AS amount_eur,
                    oo.round AS round,
                    oo.deal_type AS deal_type
             FROM "OPPORTUNITY" oo
             WHERE oo.status = 'DEAL'::"OpportunityStatus"
               AND oo.proposed_amount_eur IS NOT NULL
               AND (
                 (oo.source_type = 'STARTUP'::"EntityType" AND oo.source_id = CASE WHEN o.target_type = 'STARTUP' THEN o.target_id WHEN o.source_type = 'STARTUP' THEN o.source_id ELSE -1 END)
                 OR
                 (oo.target_type = 'STARTUP'::"EntityType" AND oo.target_id = CASE WHEN o.target_type = 'STARTUP' THEN o.target_id WHEN o.source_type = 'STARTUP' THEN o.source_id ELSE -1 END)
               )
             ORDER BY oo.updated_at ASC
             LIMIT 6
           ) x
         ) AS startup_investment_history
       FROM "OPPORTUNITY" o
       WHERE (o.source_type = $1::"EntityType" AND o.source_id = $2)
          OR (o.target_type = $1::"EntityType" AND o.target_id = $2)
       ORDER BY o.updated_at DESC OFFSET $3 LIMIT $4;`,
      sourceType, entityId, offset, limit
    );
    const countRows = await (prisma as any).$queryRawUnsafe(
      `SELECT COUNT(*)::bigint AS count FROM "OPPORTUNITY"
        WHERE (source_type = $1::"EntityType" AND source_id = $2)
          OR (target_type = $1::"EntityType" AND target_id = $2);`,
      sourceType, entityId
    );
    const total = Number((countRows as any[])[0]?.count ?? 0);
    return { items: (rows as any[]).map((r) => this.mapRow(r as Record<string, unknown>)), total };
  }

  async updateStatus(id: string, status: OpportunityStatus, reason?: string | null): Promise<Opportunity | null> {
    const d = this.delegate;
    if (!d) {
      const rows = await (prisma as any).$queryRawUnsafe(
        `UPDATE "OPPORTUNITY" SET status = $1::"OpportunityStatus", reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *;`,
        this.mapStatusToPrisma(status), reason ?? null, id
      );
      const r = (rows as any[])[0];
      return r ? this.mapRow(r as Record<string, unknown>) : null;
    }
    const updated = await d.update({ where: { id }, data: { status: this.mapStatusToPrisma(status), reason: reason ?? null } });
    return updated ? this.map(updated) : null;
  }

  async updateFields(
    id: string,
    data: {
      deal_type?: string | null;
      round?: string | null;
      proposed_amount_eur?: number | null;
      valuation_pre_money_eur?: number | null;
      ownership_target_pct?: number | null;
      fund_id?: string | null;
      budget_fit?: string | null;
      budget_fit_score?: number | null;
      pilot_estimated_cost_eur?: number | null;
      pilot_budget_fit?: string | null;
      term_deadline?: Date | null;
    }
  ): Promise<Opportunity | null> {
    const d = this.delegate;
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return this.getById(id);
    if (!d) {
      const cast = (k: string) => {
        switch (k) {
          case 'deal_type': return '::"DealType"';
          case 'round': return '::"Round"';
          case 'budget_fit': return '::"BudgetFit"';
          case 'pilot_budget_fit': return '::"PilotBudgetFit"';
          default: return '';
        }
      };
      const cols = entries.map(([k], i) => `${this.toColumn(k)} = $${i + 2}${cast(k)}`).join(", ");
      const params: any[] = [id, ...entries.map(([, v]) => v)];
      const rows = await (prisma as any).$queryRawUnsafe(
        `UPDATE "OPPORTUNITY" SET ${cols}, updated_at = NOW() WHERE id = $1 RETURNING *;`,
        ...params
      );
      const r = (rows as any[])[0];
      return r ? this.mapRow(r as Record<string, unknown>) : null;
    }
    const prismaData: Record<string, unknown> = {};
    for (const [k, v] of entries) prismaData[this.toColumn(k)] = v as unknown;
    const updated = await d.update({ where: { id }, data: { ...prismaData } });
    return updated ? this.map(updated) : null;
  }

  private toColumn(k: string): string {
    return k;
  }

  async logEvent(evt: Omit<OpportunityEvent, 'id' | 'occurred_at'> & { occurred_at?: Date | undefined; }): Promise<OpportunityEvent> {
    const d = (prisma as any).oPPORTUNITY_EVENT;
    if (!d) {
      const rows = await (prisma as any).$queryRawUnsafe(
        `INSERT INTO "OPPORTUNITY_EVENT" (id, opportunity_id, type, payload, occurred_at)
         VALUES ($1, $2, $3::"OpportunityEventType", $4::jsonb, $5) RETURNING *;`,
        randomUUID(),
        evt.opportunity_id,
        this.mapEventTypeToPrisma(evt.type),
        evt.payload ? JSON.stringify(evt.payload) : null,
        evt.occurred_at ?? new Date()
      );
      const created = (rows as any[])[0];
      return {
        id: created.id,
        opportunity_id: created.opportunity_id,
        occurred_at: created.occurred_at,
        type: this.mapEventTypeToDomain(created.type),
        payload: created.payload as Record<string, unknown> | null,
      };
    }
    const created = await d.create({
      data: {
        opportunity_id: evt.opportunity_id,
        type: this.mapEventTypeToPrisma(evt.type),
        payload: evt.payload as unknown as object | undefined,
        occurred_at: evt.occurred_at ?? new Date(),
      }
    });
    return {
      id: created.id,
      opportunity_id: created.opportunity_id,
      occurred_at: created.occurred_at,
      type: this.mapEventTypeToDomain(created.type),
      payload: created.payload as Record<string, unknown> | null,
    };
  }

  // Mappers between Prisma enums (UPPERCASE) and domain strings
  private mapEntityToPrisma(t: EntityType) {
    switch (t) {
      case 'STARTUP': return 'STARTUP';
      case 'INVESTOR': return 'INVESTOR';
      case 'PARTNER': return 'PARTNER';
    }
  }
  private mapEntityToDomain(t: string): EntityType { return t as EntityType; }

  private mapStatusToPrisma(s: OpportunityStatus) {
    switch (s) {
      case 'new': return 'NEW';
      case 'qualified': return 'QUALIFIED';
      case 'contacted': return 'CONTACTED';
      case 'in_discussion': return 'IN_DISCUSSION';
      case 'pilot': return 'PILOT';
      case 'deal': return 'DEAL';
      case 'lost': return 'LOST';
    }
  }
  private mapStatusToDomain(s: string): OpportunityStatus {
    const map = {
      NEW: 'new',
      QUALIFIED: 'qualified',
      CONTACTED: 'contacted',
      IN_DISCUSSION: 'in_discussion',
      PILOT: 'pilot',
      DEAL: 'deal',
      LOST: 'lost',
    } as const;
    return (map[s as keyof typeof map] ?? 'new') as OpportunityStatus;
  }

  private mapDirectionToPrisma(d: any) {
    const map: Record<string, string> = {
      'S->I': 'S_TO_I',
      'S->P': 'S_TO_P',
      'I->S': 'I_TO_S',
      'P->S': 'P_TO_S'
    };
    return map[d] as any;
  }
  private mapDirectionToDomain(d: string) {
    const map: Record<string, string> = {
      S_TO_I: 'S->I',
      S_TO_P: 'S->P',
      I_TO_S: 'I->S',
      P_TO_S: 'P->S'
    };
    return map[d] as any;
  }

  private mapEventTypeToPrisma(t: string) {
    const m: Record<string, string> = {
      auto_created: 'AUTO_CREATED',
      rescored: 'RESCORED',
      status_changed: 'STATUS_CHANGED',
      note: 'NOTE',
      email_sent: 'EMAIL_SENT',
      meeting: 'MEETING',
      pilot_started: 'PILOT_STARTED',
      deal_signed: 'DEAL_SIGNED',
    };
    return m[t] as any;
  }
  private mapEventTypeToDomain(t: string): string {
    const m: Record<string, string> = {
      AUTO_CREATED: 'auto_created',
      RESCORED: 'rescored',
      STATUS_CHANGED: 'status_changed',
      NOTE: 'note',
      EMAIL_SENT: 'email_sent',
      MEETING: 'meeting',
      PILOT_STARTED: 'pilot_started',
      DEAL_SIGNED: 'deal_signed',
    };
    return m[t] ?? 'note';
  }
}
