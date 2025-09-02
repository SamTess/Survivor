
export interface News {
    id: number;
    title: string;
    news_date?: string;
    location?: string;
    category?: string;
    startup_id?: number;
    created_at: string;
    updated_at: string;
}

export interface NewsDetail extends News {
    description: string;
}
