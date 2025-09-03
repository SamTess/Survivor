"use client";

import NewsCard from "@/components/cards/NewsCard";
import news from "@/mocks/news.json";
import { useMemo } from "react";
import { Newspaper } from "lucide-react";

export function LatestNews() {
  const list = useMemo(() => {
    return [...news]
      .sort((a, b) => {
        const da = new Date(a.news_date || a.created_at || 0).getTime();
        const db = new Date(b.news_date || b.created_at || 0).getTime();
        return db - da;
      })
      .slice(0, 3);
  }, []);
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Newspaper className="h-5 w-5" /></div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Latest News</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {list.map(n => (
            <NewsCard key={n.id} id={n.id} title={n.title} news_date={n.news_date} description={n.description} />
          ))}
        </div>
      </div>
    </section>
  );
}
