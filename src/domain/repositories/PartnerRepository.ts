import { Partner } from "../interfaces/Partner";

export interface PartnerRepository {
  // Create
  create(partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<Partner>;
  
  // Read
  getById(id: number): Promise<Partner | null>;
  getAll(): Promise<Partner[]>;
  getByEmail(email: string): Promise<Partner | null>;
  getByPartnershipType(partnershipType: string): Promise<Partner[]>;
  search(query: string): Promise<Partner[]>;
  
  // Update
  update(id: number, partner: Partial<Omit<Partner, 'id' | 'created_at' | 'updated_at'>>): Promise<Partner | null>;
  
  // Delete
  delete(id: number): Promise<boolean>;
  
  // Pagination
  getPaginated(page: number, limit: number): Promise<{ partners: Partner[], total: number }>;
}
