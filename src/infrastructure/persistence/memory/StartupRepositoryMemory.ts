import { Startup } from "../../../domain/entities/Startup";
import { StartupRepository } from "../../repositories/StartupRepository";

export class StartupRepositoryMemory implements StartupRepository {
  constructor(private startups: Startup[] = []) {}

  async getById(id: number): Promise<Startup | null> {
    return this.startups.find(s => s.id === id) ?? null;
  }

  async listFeatured(limit = 3): Promise<Startup[]> { return this.startups.slice(0, limit); }
  async listAll(): Promise<Startup[]> { return [...this.startups]; }

  async save(startup: Startup): Promise<void> {
    const idx = this.startups.findIndex(s => s.id === startup.id);
    if (idx === -1) this.startups.push(startup); else this.startups[idx] = startup;
  }

  // Helpers tests/dev
  insert(startup: Startup) { this.startups.push(startup); }
  clear() { this.startups.splice(0, this.startups.length); }
  all() { return [...this.startups]; }
}
