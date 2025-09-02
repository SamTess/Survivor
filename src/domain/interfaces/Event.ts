
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
