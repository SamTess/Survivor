export interface StartupFounder {
    id: number;
    name: string;
    startup_id: number;
}

export interface StartupDetail {
    id: number;
    name: string;
    email: string;
    legal_status?: string;
    address?: string;
    phone?: string;
    website_url?: string;
    social_media_url?: string;
    project_status?: string;
    needs?: string;
    sector?: string;
    maturity?: string;
    founders: string[]
    created_at: Date;
    updated_at: Date;
}

export interface StartupDetailApiResponse {
    id: number;
    name: string;
    email: string;
    legal_status?: string;
    address?: string;
    phone?: string;
    website_url?: string;
    social_media_url?: string;
    project_status?: string;
    needs?: string;
    sector?: string;
    maturity?: string;
    founders: StartupFounder[]
    created_at: string;
    updated_at: string;
}

export interface StartupList {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    legal_status?: string;
    sector?: string;
    maturity?: string;
    created_at: Date;
    updated_at: Date;
}

export interface StartupListApiResponse {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    legal_status?: string;
    sector?: string;
    maturity?: string;
    created_at: string;
    updated_at: string;
}
