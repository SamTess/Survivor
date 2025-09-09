import prisma from './client';
import { FeatureRepository, FeatureVector } from '../../../domain/repositories/FeatureRepository';

export class FeatureRepositoryPrisma implements FeatureRepository {
  async upsert(vec: FeatureVector): Promise<void> {
  await prisma.fEATURE_VECTOR.upsert({
      where: { entity_type_entity_id: { entity_type: vec.entity_type, entity_id: vec.entity_id } },
      create: { entity_type: vec.entity_type, entity_id: vec.entity_id, tags: vec.tags, tfidf: vec.tfidf as unknown as object },
      update: { tags: vec.tags, tfidf: vec.tfidf as unknown as object },
    });
  }
  async get(entity_type: FeatureVector['entity_type'], entity_id: number): Promise<FeatureVector | null> {
  const row = await prisma.fEATURE_VECTOR.findUnique({ where: { entity_type_entity_id: { entity_type, entity_id } } });
    if (!row) return null;
    return { entity_type: row.entity_type, entity_id: row.entity_id, tags: row.tags as string[], tfidf: row.tfidf as number[], updated_at: row.updated_at };
  }
}
