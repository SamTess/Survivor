import { StartupRepository } from "../../../domain/repositories/StartupRepository";
import { Startup } from "../../../domain/entities/Startup";

export class StartupService {
  constructor(private readonly startupRepository: StartupRepository) {}

  async createStartup(startup: Omit<Startup, 'id' | 'created_at'>): Promise<Startup> {
    if (!startup.name || !startup.email || !startup.legal_status || !startup.address || !startup.phone || !startup.sector || !startup.maturity || !startup.description) {
      throw new Error("Missing required fields");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(startup.email)) {
      throw new Error("Invalid email format");
    }

    const existingStartup = await this.startupRepository.getByEmail(startup.email);
    if (existingStartup) {
      throw new Error("Startup with this email already exists");
    }

    return this.startupRepository.create(startup);
  }

  async getStartupById(id: number): Promise<Startup | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid startup ID");
    }

    return this.startupRepository.getById(id);
  }

  async getAllStartups(): Promise<Startup[]> {
    return this.startupRepository.getAll();
  }

  async getStartupsBysector(sector: string): Promise<Startup[]> {
    if (!sector || sector.trim().length === 0) {
      throw new Error("Sector cannot be empty");
    }

    return this.startupRepository.getBySector(sector.trim());
  }

  async getStartupsByMaturity(maturity: string): Promise<Startup[]> {
    if (!maturity || maturity.trim().length === 0) {
      throw new Error("Maturity cannot be empty");
    }

    return this.startupRepository.getByMaturity(maturity.trim());
  }

  async searchStartups(query: string): Promise<Startup[]> {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters long");
    }

    return this.startupRepository.search(query.trim());
  }

  async updateStartup(id: number, updates: Partial<Omit<Startup, 'id' | 'created_at'>>): Promise<Startup | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid startup ID");
    }

    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        throw new Error("Invalid email format");
      }

      const existingStartup = await this.startupRepository.getByEmail(updates.email);
      if (existingStartup && existingStartup.id !== id) {
        throw new Error("Email already used by another startup");
      }
    }

    const existing = await this.startupRepository.getById(id);
    if (!existing) {
      throw new Error("Startup not found");
    }

    return this.startupRepository.update(id, updates);
  }

  async deleteStartup(id: number): Promise<boolean> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid startup ID");
    }

    const existing = await this.startupRepository.getById(id);
    if (!existing) {
      throw new Error("Startup not found");
    }

    return this.startupRepository.delete(id);
  }

  async getStartupsPaginated(page: number, limit: number): Promise<{ startups: Startup[], total: number }> {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error("Page must be a positive integer");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    return this.startupRepository.getPaginated(page, limit);
  }
}
