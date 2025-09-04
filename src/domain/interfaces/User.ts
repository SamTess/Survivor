
export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    address: string; // required by schema
    phone?: string | null;
    legal_status?: string | null;
    description?: string | null;
    founder_id?: number;
    investor_id?: number;
    created_at: Date;
    // DB schema currently has no updated_at column; repository maps this to created_at as fallback
    updated_at: Date;
}

export interface UserApiResponse {
    id: number;
    email: string;
    name: string;
    role: string;
    founder_id?: number;
    investor_id?: number;
    created_at: string;
    updated_at: string;
}
