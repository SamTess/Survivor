import prisma from './client';
import { OpportunityReadRepository, StartupForScoring } from '../../../domain/repositories/OpportunityReadRepository';

export class OpportunityReadRepositoryPrisma implements OpportunityReadRepository {
  async getStartupForScoring(id: number): Promise<StartupForScoring | null> {
    const s = await prisma.s_STARTUP.findUnique({ where: { id }, include: { details: true } });
    if (!s) return null;
    return {
      id: s.id,
      sector: s.sector,
      description: s.description,
      maturity: s.maturity,
      address: s.address,
      created_at: s.created_at,
      viewsCount: s.viewsCount,
      likesCount: s.likesCount,
      bookmarksCount: s.bookmarksCount,
      details: s.details.map(d => ({ needs: d.needs })),
    };
  }
}
