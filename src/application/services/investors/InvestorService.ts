import { InvestorRepository } from "../../../domain/repositories/InvestorRepository";
import { Investor } from "../../../domain/interfaces/Investor";

export class InvestorService {
  constructor(private readonly investorRepository: InvestorRepository) {}

  async createInvestor(investor: Omit<Investor, 'id' | 'created_at' | 'updated_at'>): Promise<Investor> {
    if (!investor.name || !investor.email) {
      throw new Error("Name and email are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(investor.email)) {
      throw new Error("Invalid email format");
    }

    const existingInvestor = await this.investorRepository.getByEmail(investor.email);
    if (existingInvestor) {
      throw new Error("Investor with this email already exists");
    }

    return this.investorRepository.create(investor);
  }

  async getInvestorById(id: number): Promise<Investor | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid investor ID");
    }

    return this.investorRepository.getById(id);
  }

  async getAllInvestors(): Promise<Investor[]> {
    return this.investorRepository.getAll();
  }

  async getInvestorByEmail(email: string): Promise<Investor | null> {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email");
    }

    return this.investorRepository.getByEmail(email);
  }

  async getInvestorsByType(investorType: string): Promise<Investor[]> {
    if (!investorType || investorType.trim().length === 0) {
      throw new Error("Investor type cannot be empty");
    }

    return this.investorRepository.getByInvestorType(investorType.trim());
  }

  async getInvestorsByFocus(investmentFocus: string): Promise<Investor[]> {
    if (!investmentFocus || investmentFocus.trim().length === 0) {
      throw new Error("Investment focus cannot be empty");
    }

    return this.investorRepository.getByInvestmentFocus(investmentFocus.trim());
  }

  async searchInvestors(query: string): Promise<Investor[]> {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters long");
    }

    return this.investorRepository.search(query.trim());
  }

  async updateInvestor(id: number, updates: Partial<Omit<Investor, 'id' | 'created_at' | 'updated_at'>>): Promise<Investor | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid investor ID");
    }

    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        throw new Error("Invalid email format");
      }

      const existingInvestor = await this.investorRepository.getByEmail(updates.email);
      if (existingInvestor && existingInvestor.id !== id) {
        throw new Error("Email already used by another investor");
      }
    }

    const existing = await this.investorRepository.getById(id);
    if (!existing) {
      throw new Error("Investor not found");
    }

    return this.investorRepository.update(id, updates);
  }

  async deleteInvestor(id: number): Promise<boolean> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid investor ID");
    }

    const existing = await this.investorRepository.getById(id);
    if (!existing) {
      throw new Error("Investor not found");
    }

    return this.investorRepository.delete(id);
  }

  async getInvestorsPaginated(page: number, limit: number): Promise<{ investors: Investor[], total: number }> {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error("Page must be a positive integer");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    return this.investorRepository.getPaginated(page, limit);
  }
}
