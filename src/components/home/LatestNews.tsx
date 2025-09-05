"use client";

import NewsCard from "@/components/cards/NewsCard";
import { Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { NewsDetailApiResponse } from "@/domain/interfaces/News";

export function LatestNews() {
  const [news, setNews] = useState<NewsDetailApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/news?limit=6');
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data)) {
          const sorted = [...json.data].sort((a,b) => {
            const da = new Date(a.news_date || a.created_at || 0).getTime();
            const db = new Date(b.news_date || b.created_at || 0).getTime();
            return db - da;
          }).slice(0,3);
          setNews(sorted);
        }
      } catch {
        if (!cancelled) setError('Impossible de charger les news');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Newspaper className="h-5 w-5" /></div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Latest News</h2>
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Chargement...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {news.map(n => (
              <NewsCard key={n.id} id={n.id} title={n.title} news_date={n.news_date} description={n.description} imageUrl={n.image_url} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
