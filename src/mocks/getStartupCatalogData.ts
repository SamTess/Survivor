// Data loading for the Project Catalog (mock implementation)
// Keeps deterministic data generation isolated from UI logic.
import { StartupRepositoryMemory } from "@/infrastructure/persistence/memory/StartupRepositoryMemory"
import { makeStartup, resetFactories } from "@/mocks/factories"

export type StartupCard = {
  id: number;
  name: string;
  legal_status: string;
  address: string;
  phone: string;
  sector: string;
  maturity: string;
  email: string;
  description: string;
  image_data?: Uint8Array | null; // Raw binary (DB usage scenario)
  image_url?: string; // Public URL or /api route
  created_at?: Date;
}

export function getStartupCatalogData(): StartupCard[] {
  resetFactories()
  const repo = new StartupRepositoryMemory()
  repo.insert(makeStartup({ name: "AgriSmart", sector: "AgTech", maturity: "Seed", address: "Austin, TX", created_at: new Date('2024-03-20T00:00:00Z') }))
  repo.insert(makeStartup({ name: "BioMaterials", sector: "CleanTech", maturity: "Seed", address: "Portland, OR", created_at: new Date('2024-06-07T00:00:00Z') }))
  repo.insert(makeStartup({ name: "EcoTech Solutions", sector: "CleanTech", maturity: "Series A", address: "San Francisco, CA", created_at: new Date('2024-01-02T00:00:00Z') }))
  repo.insert(makeStartup({ name: "FinFlow", sector: "FinTech", maturity: "Pre-Seed", address: "New York, NY", created_at: new Date('2024-03-05T00:00:00Z') }))
  repo.insert(makeStartup({ name: "HealthAI", sector: "HealthTech", maturity: "Seed", address: "Boston, MA", created_at: new Date('2024-02-10T00:00:00Z') }))
  repo.insert(makeStartup({ name: "CyberShield", sector: "CyberSecurity", maturity: "Seed", address: "Denver, CO", created_at: new Date('2024-05-01T00:00:00Z') }))
  repo.insert(makeStartup({ name: "EduVerse", sector: "EdTech", maturity: "Series A", address: "Seattle, WA", created_at: new Date('2024-04-15T00:00:00Z') }))
  repo.insert(makeStartup({ name: "SpaceLogistics", sector: "SpaceTech", maturity: "Pre-Seed", address: "Los Angeles, CA", created_at: new Date('2024-05-18T00:00:00Z') }))
  const imagePool = [
    '/smart-agriculture-iot-sensors.png',
    '/sustainable-biomaterials-packaging.png',
    '/sustainable-technology-clean-energy.png',
    '/financial-technology-dashboard.png',
    '/medical-ai-diagnostic-technology.png',
    '/cybersecurity-shield.png',
    '/virtual-reality-education-classroom.png',
    '/satellite-space-logistics-tracking.png',
  ]
  return repo.all().map((s, idx) => ({
    id: s.id,
    name: s.name,
    legal_status: s.legal_status,
    address: s.address,
    phone: s.phone,
    sector: s.sector,
    maturity: s.maturity,
    email: s.email,
    description: s.description,
    image_data: s.image_data,
    image_url: imagePool[idx % imagePool.length],
    created_at: s.created_at || new Date('2024-01-01T00:00:00Z'),
  }))
}
