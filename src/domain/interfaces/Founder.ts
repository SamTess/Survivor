
export interface Founder {
    name: string;
    id: number;
    startup_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface FounderApiResponse {
    name: string;
    id: number;
    startup_id: number;
    created_at: string;
    updated_at: string;
}
