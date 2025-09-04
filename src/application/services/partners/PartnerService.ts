import { PartnerRepository } from "../../../domain/repositories/PartnerRepository";
import { Partner } from "../../../domain/interfaces/Partner";

export class PartnerService {
  constructor(private readonly partnerRepository: PartnerRepository) {}

  async createPartner(partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<Partner> {
    if (!partner.name || !partner.email) {
      throw new Error("Name and email are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(partner.email)) {
      throw new Error("Invalid email format");
    }

    const existingPartner = await this.partnerRepository.getByEmail(partner.email);
    if (existingPartner) {
      throw new Error("Partner with this email already exists");
    }

    return this.partnerRepository.create(partner);
  }

  async getPartnerById(id: number): Promise<Partner | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid partner ID");
    }

    return this.partnerRepository.getById(id);
  }

  async getAllPartners(): Promise<Partner[]> {
    return this.partnerRepository.getAll();
  }

  async getPartnerByEmail(email: string): Promise<Partner | null> {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email");
    }

    return this.partnerRepository.getByEmail(email);
  }

  async getPartnersByType(partnershipType: string): Promise<Partner[]> {
    if (!partnershipType || partnershipType.trim().length === 0) {
      throw new Error("Partnership type cannot be empty");
    }

    return this.partnerRepository.getByPartnershipType(partnershipType.trim());
  }

  async searchPartners(query: string): Promise<Partner[]> {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters long");
    }

    return this.partnerRepository.search(query.trim());
  }

  async updatePartner(id: number, updates: Partial<Omit<Partner, 'id' | 'created_at' | 'updated_at'>>): Promise<Partner | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid partner ID");
    }

    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        throw new Error("Invalid email format");
      }

      const existingPartner = await this.partnerRepository.getByEmail(updates.email);
      if (existingPartner && existingPartner.id !== id) {
        throw new Error("Email already used by another partner");
      }
    }

    const existing = await this.partnerRepository.getById(id);
    if (!existing) {
      throw new Error("Partner not found");
    }

    return this.partnerRepository.update(id, updates);
  }

  async deletePartner(id: number): Promise<boolean> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid partner ID");
    }

    const existing = await this.partnerRepository.getById(id);
    if (!existing) {
      throw new Error("Partner not found");
    }

    return this.partnerRepository.delete(id);
  }

  async getPartnersPaginated(page: number, limit: number): Promise<{ partners: Partner[], total: number }> {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error("Page must be a positive integer");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    return this.partnerRepository.getPaginated(page, limit);
  }
}
