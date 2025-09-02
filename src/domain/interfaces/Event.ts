
export interface Event {
    id: number;
    name: string;
    dates?: string;
    location?: string;
    description?: string;
    event_type?: string;
    target_audience?: string;
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
    created_at: string;
    updated_at: string;
}
