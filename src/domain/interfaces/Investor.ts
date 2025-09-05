
export interface Investor {
    id: number;
    email: string;
    name: string;
    description?: string;
    phone?: string;
    address?: string;
    legal_status?: string;
    investor_type?: string;
    investment_focus?: string;
    created_at: Date;
    updated_at: Date;
}

export interface InvestorApiResponse {
    id: number;
    email: string;
    name: string;
    description?: string;
    phone?: string;
    address?: string;
    legal_status?: string;
    investor_type?: string;
    investment_focus?: string;
    created_at: string;
}

