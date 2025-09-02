
export interface Partner {
    id: number;
    name: string;
    email: string;
    legal_status?: string;
    address?: string;
    phone?: string;
    partnership_type?: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

export interface PartnerApiResponse {
    id: number;
    name: string;
    email: string;
    legal_status?: string;
    address?: string;
    phone?: string;
    partnership_type?: string;
    description?: string;
    created_at: string;
    updated_at: string;
}