export type FeatureVector = {
  entity_type: 'STARTUP'|'INVESTOR'|'PARTNER';
  entity_id: number;
  tags: string[];
  tfidf: number[];
  updated_at?: Date;
};

export interface FeatureRepository {
  upsert(vec: FeatureVector): Promise<void>;
  get(entity_type: FeatureVector['entity_type'], entity_id: number): Promise<FeatureVector | null>;
}
