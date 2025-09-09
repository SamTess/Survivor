/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "./client";
import { OpportunityRepository } from "../../../domain/repositories/OpportunityRepository";
import { Opportunity, OpportunityEvent } from "../../../domain/entities/Opportunity";
import { EntityType, OpportunityStatus } from "../../../domain/enums/Opportunities";

export class OpportunityRepositoryPrisma implements OpportunityRepository {
  private map(o: Record<string, unknown>): Opportunity {
    return {
      id: o.id as string,
      direction: this.mapDirectionToDomain(o.direction as string),
      source_type: this.mapEntityToDomain(o.source_type as string),
      source_id: o.source_id as number,
      target_type: this.mapEntityToDomain(o.target_type as string),
      target_id: o.target_id as number,
      score: (o.score !== null && o.score !== undefined) ? Number(o.score as any) : null,
      score_breakdown: (o.score_breakdown as Record<string, number>) || null,
      status: this.mapStatusToDomain(o.status as string),
      reason: (o.reason as string) ?? null,
      next_action: (o.next_action as string) ?? null,
      owner_user_id: (o.owner_user_id as number) ?? null,
      created_at: o.created_at as Date,
      updated_at: o.updated_at as Date,
    };
  }

  async upsertUnique(op: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Opportunity> {
    const created = await (prisma as any).oPPORTUNITY.upsert({
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
      },
      update: {
        score: op.score ?? null,
        score_breakdown: op.score_breakdown as unknown as object | undefined,
        status: this.mapStatusToPrisma(op.status),
        reason: op.reason ?? null,
        next_action: op.next_action ?? null,
        owner_user_id: op.owner_user_id ?? null,
      },
    });
    return this.map(created);
  }

  async getById(id: string): Promise<Opportunity | null> {
    const res = await (prisma as any).oPPORTUNITY.findUnique({ where: { id } });
    return res ? this.map(res) : null;
  }

  async listByStatus(status: OpportunityStatus, page: number, limit: number): Promise<{ items: Opportunity[]; total: number; }> {
    const where = { status: this.mapStatusToPrisma(status) } as const;
    const [rows, total] = await Promise.all([
      (prisma as any).oPPORTUNITY.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { updated_at: 'desc' } }),
      (prisma as any).oPPORTUNITY.count({ where }),
    ]);
    return { items: (rows as Record<string, unknown>[]).map((r) => this.map(r)), total };
  }

  async listForEntity(entityType: EntityType, entityId: number, page: number, limit: number): Promise<{ items: Opportunity[]; total: number; }> {
    const where = {
      OR: [
        { source_type: this.mapEntityToPrisma(entityType), source_id: entityId },
        { target_type: this.mapEntityToPrisma(entityType), target_id: entityId },
      ],
    } as const;
    const [rows, total] = await Promise.all([
      (prisma as any).oPPORTUNITY.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { updated_at: 'desc' } }),
      (prisma as any).oPPORTUNITY.count({ where }),
    ]);
    return { items: (rows as Record<string, unknown>[]).map((r) => this.map(r)), total };
  }

  async updateStatus(id: string, status: OpportunityStatus, reason?: string | null): Promise<Opportunity | null> {
    const updated = await (prisma as any).oPPORTUNITY.update({ where: { id }, data: { status: this.mapStatusToPrisma(status), reason: reason ?? null } });
    return updated ? this.map(updated) : null;
  }

  async logEvent(evt: Omit<OpportunityEvent, 'id' | 'occurred_at'> & { occurred_at?: Date | undefined; }): Promise<OpportunityEvent> {
    const created = await (prisma as any).oPPORTUNITY_EVENT.create({
      data: {
        opportunity_id: evt.opportunity_id,
        type: this.mapEventTypeToPrisma(evt.type),
        payload: evt.payload as unknown as object | undefined,
        occurred_at: evt.occurred_at ?? new Date(),
      }
    });
    return {
      id: created.id, opportunity_id: created.opportunity_id, occurred_at: created.occurred_at, type: this.mapEventTypeToDomain(created.type), payload: created.payload as Record<string, unknown> | null,
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
      NEW: 'new', QUALIFIED: 'qualified', CONTACTED: 'contacted', IN_DISCUSSION: 'in_discussion', PILOT: 'pilot', DEAL: 'deal', LOST: 'lost',
    } as const;
    return (map[s as keyof typeof map] ?? 'new') as OpportunityStatus;
  }

  private mapDirectionToPrisma(d: any) {
    const map: Record<string, string> = { 'S->I': 'S_TO_I', 'S->P': 'S_TO_P', 'I->S': 'I_TO_S', 'P->S': 'P_TO_S' };
    return map[d] as any;
  }
  private mapDirectionToDomain(d: string) {
    const map: Record<string, string> = { S_TO_I: 'S->I', S_TO_P: 'S->P', I_TO_S: 'I->S', P_TO_S: 'P->S' };
    return map[d] as any;
  }

  private mapEventTypeToPrisma(t: string) {
    const m: Record<string, string> = {
      auto_created: 'AUTO_CREATED', rescored: 'RESCORED', status_changed: 'STATUS_CHANGED', note: 'NOTE', email_sent: 'EMAIL_SENT', meeting: 'MEETING', pilot_started: 'PILOT_STARTED', deal_signed: 'DEAL_SIGNED',
    };
    return m[t] as any;
  }
  private mapEventTypeToDomain(t: string): string {
    const m: Record<string, string> = {
      AUTO_CREATED: 'auto_created', RESCORED: 'rescored', STATUS_CHANGED: 'status_changed', NOTE: 'note', EMAIL_SENT: 'email_sent', MEETING: 'meeting', PILOT_STARTED: 'pilot_started', DEAL_SIGNED: 'deal_signed',
    };
    return m[t] ?? 'note';
  }
}
