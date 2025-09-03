import { FounderRepository } from "../../../domain/repositories/FounderRepository";
import { Founder } from "../../../domain/interfaces/Founder";

export class FounderService {
  constructor(private readonly founderRepository: FounderRepository) {}

  async createFounder(founder: Omit<Founder, 'id' | 'created_at' | 'updated_at'>): Promise<Founder> {
    // Validate required fields
    if (!founder.name || !founder.startup_id) {
      throw new Error("Name and startup ID are required");
    }

    if (!Number.isInteger(founder.startup_id) || founder.startup_id <= 0) {
      throw new Error("Invalid startup ID");
    }

    return this.founderRepository.create(founder);
  }

  async getFounderById(id: number): Promise<Founder | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid founder ID");
    }

    return this.founderRepository.getById(id);
  }

  async getAllFounders(): Promise<Founder[]> {
    return this.founderRepository.getAll();
  }

  async getFoundersByStartupId(startupId: number): Promise<Founder[]> {
    if (!Number.isInteger(startupId) || startupId <= 0) {
      throw new Error("Invalid startup ID");
    }

    return this.founderRepository.getByStartupId(startupId);
  }

  async getFoundersByUserId(userId: number): Promise<Founder[]> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("Invalid user ID");
    }

    return this.founderRepository.getByUserId(userId);
  }

  async updateFounder(id: number, updates: Partial<Omit<Founder, 'id' | 'created_at' | 'updated_at'>>): Promise<Founder | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid founder ID");
    }

    if (updates.startup_id && (!Number.isInteger(updates.startup_id) || updates.startup_id <= 0)) {
      throw new Error("Invalid startup ID");
    }

    const existing = await this.founderRepository.getById(id);
    if (!existing) {
      throw new Error("Founder not found");
    }

    return this.founderRepository.update(id, updates);
  }

  async deleteFounder(id: number): Promise<boolean> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid founder ID");
    }

    const existing = await this.founderRepository.getById(id);
    if (!existing) {
      throw new Error("Founder not found");
    }

    return this.founderRepository.delete(id);
  }

  async deleteFoundersByStartupId(startupId: number): Promise<boolean> {
    if (!Number.isInteger(startupId) || startupId <= 0) {
      throw new Error("Invalid startup ID");
    }

    return this.founderRepository.deleteByStartupId(startupId);
  }

  async isFounderOfStartup(userId: number, startupId: number): Promise<boolean> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("Invalid user ID");
    }

    if (!Number.isInteger(startupId) || startupId <= 0) {
      throw new Error("Invalid startup ID");
    }

    return this.founderRepository.isFounderOfStartup(userId, startupId);
  }
}
