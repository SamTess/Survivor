
export interface Event {
    id: number;
    name: string;
    dates?: string;
    location?: string;
    description?: string;
    event_type?: string;
    target_audience?: string;
    image_url?: string; // URL vers l'image servie par l'API
    created_at: Date;
    updated_at: Date;
}

export interface EventApiResponse {
    id: number;
    name: string;
    dates?: string;
    location?: string;
    description?: string;
    event_type?: string;
    target_audience?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
}
