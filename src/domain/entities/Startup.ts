// Entité domaine alignée directement sur le modèle Prisma S_STARTUP.
// Pas de champs "mock only" ici pour éviter la confusion. Ceux nécessaires à l'UI
// (funding, teamSize, founded, image…) pourront être gérés dans un DTO/ViewModel séparé.

export type Startup = {
  id: number;
  name: string;
  legal_status: string;
  address: string;
  phone: string;
  sector: string;
  maturity: string;
  email: string;
  description: string;
  image_data?: Uint8Array | null;
  created_at?: Date;
};
