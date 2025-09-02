
export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    founder_id?: number;
    investor_id?: number;
    created_at: Date;
    updated_at: Date;
}
