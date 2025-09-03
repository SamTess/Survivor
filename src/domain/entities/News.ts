import { Startup } from "./Startup";

export type News = {
    id: number;
    title: string;
    description?: string;
    image_data?: Uint8Array | null;
    startup_id: number;
    news_date?: Date;
    location?: string;
    category?: string;
    created_at?: Date;
    startup: Startup;
};
