import { Founder } from "../interfaces/Founder";

export interface FounderRepository {
  // Create
  create(founder: Omit<Founder, 'id' | 'created_at' | 'updated_at'>): Promise<Founder>;
  
  // Read
  getById(id: number): Promise<Founder | null>;
  getAll(): Promise<Founder[]>;
  getByStartupId(startupId: number): Promise<Founder[]>;
  getByUserId(userId: number): Promise<Founder[]>;
  
  // Update
  update(id: number, founder: Partial<Omit<Founder, 'id' | 'created_at' | 'updated_at'>>): Promise<Founder | null>;
  
  // Delete
  delete(id: number): Promise<boolean>;
  deleteByStartupId(startupId: number): Promise<boolean>;
  
  // Special operations
  isFounderOfStartup(userId: number, startupId: number): Promise<boolean>;
}
