import { Investor } from "../interfaces/Investor";

export interface InvestorRepository {
  // Create
  create(investor: Omit<Investor, 'id' | 'created_at' | 'updated_at'>): Promise<Investor>;

  // Read
  getById(id: number): Promise<Investor | null>;
  getAll(): Promise<Investor[]>;
  getByEmail(email: string): Promise<Investor | null>;
  getByUserId(userId: number): Promise<Investor | null>;
  getByInvestorType(investorType: string): Promise<Investor[]>;
  getByInvestmentFocus(investmentFocus: string): Promise<Investor[]>;
  search(query: string): Promise<Investor[]>;

  // Update
  update(id: number, investor: Partial<Omit<Investor, 'id' | 'created_at' | 'updated_at'>>): Promise<Investor | null>;

  // Delete
  delete(id: number): Promise<boolean>;

  // Pagination
  getPaginated(page: number, limit: number): Promise<{ investors: Investor[], total: number }>;
}
