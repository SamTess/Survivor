import { Startup } from "../entities/Startup";

export interface StartupRepository {
  // Create
  create(startup: Omit<Startup, 'id' | 'created_at'>): Promise<Startup>;

  // Read
  getById(id: number): Promise<Startup | null>;
  getAll(): Promise<Startup[]>;
  getByEmail(email: string): Promise<Startup | null>;
  getBySector(sector: string): Promise<Startup[]>;
  getByMaturity(maturity: string): Promise<Startup[]>;
  search(query: string): Promise<Startup[]>;

  // Update
  update(id: number, startup: Partial<Omit<Startup, 'id' | 'created_at'>>): Promise<Startup | null>;

  // Delete
  delete(id: number): Promise<boolean>;

  // Pagination
  getPaginated(page: number, limit: number): Promise<{ startups: Startup[], total: number }>;
}
