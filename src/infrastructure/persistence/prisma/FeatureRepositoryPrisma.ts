import prisma from './client';
import { Prisma } from '@prisma/client';
import { FeatureRepository, FeatureVector } from '../../../domain/repositories/FeatureRepository';

type PrismaFeatureVectorRow = {
  entity_type: FeatureVector['entity_type'];
  entity_id: number;
  tags: string[];
  tfidf: unknown;
  updated_at: Date;
};

type FeatureVectorDelegate = {
  upsert(args: {
    where: { entity_type_entity_id: { entity_type: FeatureVector['entity_type']; entity_id: number } };
    create: { entity_type: FeatureVector['entity_type']; entity_id: number; tags: string[]; tfidf: Prisma.InputJsonValue };
    update: { tags: string[]; tfidf: Prisma.InputJsonValue };
  }): Promise<PrismaFeatureVectorRow>;
  findUnique(args: { where: { entity_type_entity_id: { entity_type: FeatureVector['entity_type']; entity_id: number } } }): Promise<PrismaFeatureVectorRow | null>;
};

const getFeatureDelegate = (): FeatureVectorDelegate =>
  (prisma as unknown as { fEATURE_VECTOR: FeatureVectorDelegate }).fEATURE_VECTOR;

export class FeatureRepositoryPrisma implements FeatureRepository {
  async upsert(vec: FeatureVector): Promise<void> {
    const featureDelegate = getFeatureDelegate();
    await featureDelegate.upsert({
      where: { entity_type_entity_id: { entity_type: vec.entity_type, entity_id: vec.entity_id } },
      create: { entity_type: vec.entity_type, entity_id: vec.entity_id, tags: vec.tags, tfidf: vec.tfidf as unknown as Prisma.InputJsonValue },
      update: { tags: vec.tags, tfidf: vec.tfidf as unknown as Prisma.InputJsonValue },
    });
  }
  async get(entity_type: FeatureVector['entity_type'], entity_id: number): Promise<FeatureVector | null> {
    const featureDelegate = getFeatureDelegate();
    const row = await featureDelegate.findUnique({ where: { entity_type_entity_id: { entity_type, entity_id } } });
    if (!row) return null;
    return { entity_type: row.entity_type, entity_id: row.entity_id, tags: row.tags as string[], tfidf: row.tfidf as number[], updated_at: row.updated_at };
  }
}
