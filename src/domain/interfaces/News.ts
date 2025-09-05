
export interface News {
    id: number;
    title: string;
    news_date?: Date;
    location?: string;
    category?: string;
    startup_id?: number;
    created_at: Date;
    updated_at: Date;
}

export interface NewsApiResponse {
    id: number;
    title: string;
    news_date?: string;
    location?: string;
    category?: string;
    startup_id?: number;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface NewsDetail extends News {
    description: string;
}

export interface NewsDetailApiResponse extends NewsApiResponse {
    description: string;
}
