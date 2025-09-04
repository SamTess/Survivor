import { Startup } from "./Startup";

export type News = {
    id: number;
    title: string;
    description?: string;
    image_data?: Uint8Array | null;
    image_url?: string; // URL d'accès à l'image via API
    startup_id: number;
    news_date?: Date;
    location?: string;
    category?: string;
    created_at?: Date;
    startup: Startup;
};
