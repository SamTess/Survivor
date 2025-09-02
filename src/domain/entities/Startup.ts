// Entité domaine alignée directement sur le modèle Prisma S_STARTUP.

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
