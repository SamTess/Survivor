import { Startup } from "../../domain/entities/Startup";

export interface StartupRepository {
  getById(id: number): Promise<Startup | null>;
  listFeatured(limit?: number): Promise<Startup[]>; // pour FeaturedProjects
  listAll(): Promise<Startup[]>; // pour ProjectCatalog
  save(startup: Startup): Promise<void>;
}
