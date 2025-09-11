"use client";

import { useState, useEffect } from "react";
import { NewsDetailApiResponse } from "@/domain/interfaces/News";
import { StartupDetailApiResponse } from "@/domain/interfaces";
import { apiService } from "@/context/auth";

interface NewsForm {
  title: string;
  news_date?: string;
  location?: string;
  category?: string;
  description?: string;
}

interface EventsNewsManagerProps {
  startup?: StartupDetailApiResponse | null;
}

export default function EventsNewsManager({ startup }: EventsNewsManagerProps) {
  const [news, setNews] = useState<NewsDetailApiResponse[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState<NewsForm>({
    title: "",
    news_date: "",
    location: startup?.address || "",
    category: startup?.sector || "",
    description: ""
  });

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError(null);
        
        // If we have a startup, fetch news for that startup specifically
        const url = startup?.id ? `/news?startupId=${startup.id}` : '/news';
        const response = await apiService.get<NewsDetailApiResponse[]>(url);

        if (response.success) {
          setNews(response.data || []);
        } else {
          setNewsError(response.error || 'Failed to fetch news');
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setNewsError('Failed to fetch news');
      } finally {
        setNewsLoading(false);
      }
    };
    
    fetchNews();
  }, [startup?.id]);

  // Update form defaults when startup data becomes available
  useEffect(() => {
    if (startup) {
      setNewsForm(prev => ({
        ...prev,
        location: prev.location || startup.address || "",
        category: prev.category || startup.sector || "",
      }));
    }
  }, [startup]);

  function addNews(e: React.FormEvent) {
    e.preventDefault();
    
    const postNews = async () => {
      try {
        setNewsSubmitting(true);
        setNewsError(null);
        setNewsSuccess(null);
        
        if (!startup?.id) {
          setNewsError('Aucune startup sélectionnée. Veuillez créer ou sélectionner votre startup avant de publier une news.');
          return;
        }
        
        const payload = {
          title: newsForm.title,
          news_date: newsForm.news_date ? new Date(newsForm.news_date).toISOString() : undefined,
          location: newsForm.location,
          category: newsForm.category,
          description: newsForm.description || "",
          startup_id: startup.id,
        };

        const data = await apiService.post<NewsDetailApiResponse>('/news', payload);
        
        if (data.success && data.data) {
          // Add the new news to the beginning of the list
          setNews((prev) => [data.data as NewsDetailApiResponse, ...prev]);
          // Reset form
          setNewsForm({ 
            title: "", 
            news_date: "", 
            location: startup?.address || "", 
            category: startup?.sector || "", 
            description: "" 
          });
          setNewsSuccess('News published successfully!');
          // Clear success message after 3 seconds
          setTimeout(() => setNewsSuccess(null), 3000);
        } else {
          console.error('Failed to create news:', data.error);
          const errorMessage = data.error || 'Failed to create news';
          setNewsError(errorMessage);
        }
      } catch (error) {
        console.error('Error creating news:', error);
        const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
        setNewsError(`Failed to create news: ${errorMessage}`);
      } finally {
        setNewsSubmitting(false);
      }
    };

    postNews();
  }

  return (
    <section className="grid grid-cols-1 gap-4 pb-16">
      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">News</h2>
          <p className="text-sm text-muted-foreground">
            {startup ? `Publish product or company updates for ${startup.name}.` : "Publish product or company updates."}
          </p>
        </div>
        <form onSubmit={addNews} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Title" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} required />
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Date (YYYY-MM-DD)" value={newsForm.news_date} onChange={(e) => setNewsForm({ ...newsForm, news_date: e.target.value })} />
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Category" value={newsForm.category} onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })} />
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Location" value={newsForm.location} onChange={(e) => setNewsForm({ ...newsForm, location: e.target.value })} />
          <textarea className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 sm:col-span-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Description" value={newsForm.description} onChange={(e) => setNewsForm({ ...newsForm, description: e.target.value })} />
          <div className="sm:col-span-2 flex justify-end">
            <button 
              type="submit" 
              disabled={newsSubmitting}
              className="rounded-2xl bg-foreground px-4 py-2 text-background hover:bg-foreground/90 transition-all duration-200 border border-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {newsSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>

        <hr className="mt-5"/>

        {newsError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {newsError}
          </div>
        )}

        {newsSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {newsSuccess}
          </div>
        )}

        {newsLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading news...
          </div>
        ) : news.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No news available yet.
          </div>
        ) : (
          <div className="divide-y">
            {news.map((n) => (
              <div key={n.id} className="py-3">
                <p className="font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-700">{n.news_date} • {n.category} • {n.location}</p>
                {n.description && <p className="text-sm text-gray-800 mt-1">{n.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
