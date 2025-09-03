"use client";

import { useMemo, useState } from "react";
import eventsJson from "@/mocks/events.json";
import newsJson from "@/mocks/news.json";
import { EventApiResponse } from "@/domain/interfaces/Event";
import { NewsDetailApiResponse } from "@/domain/interfaces/News";

interface EventForm {
  name: string;
  dates?: string;
  location?: string;
  description?: string;
  event_type?: string;
  target_audience?: string;
}

interface NewsForm {
  title: string;
  news_date?: string;
  location?: string;
  category?: string;
  description?: string;
}

export default function EventsNewsManager() {
  const [events, setEvents] = useState<EventApiResponse[]>(() => eventsJson.map(e => ({ ...e })));
  const [news, setNews] = useState<NewsDetailApiResponse[]>(() => newsJson.map(n => ({ ...n })));

  const [eventForm, setEventForm] = useState<EventForm>({ name: "", dates: "", location: "", description: "", event_type: "", target_audience: "" });
  const [newsForm, setNewsForm] = useState<NewsForm>({ title: "", news_date: "", location: "", category: "", description: "" });

  const nextEventId = useMemo(() => (events.reduce((m, e) => Math.max(m, e.id), 0) + 1), [events]);
  const nextNewsId = useMemo(() => (news.reduce((m, n) => Math.max(m, n.id), 0) + 1), [news]);

  function addEvent(e: React.FormEvent) {
    e.preventDefault();
    const payload: EventApiResponse = {
      id: nextEventId,
      ...eventForm,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEvents((prev) => [payload, ...prev]);
    setEventForm({ name: "", dates: "", location: "", description: "", event_type: "", target_audience: "" });
  }

  function addNews(e: React.FormEvent) {
    e.preventDefault();
    const payload: NewsDetailApiResponse = {
      id: nextNewsId,
      title: newsForm.title,
      news_date: newsForm.news_date,
      location: newsForm.location,
      category: newsForm.category,
      description: newsForm.description || "",
      startup_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setNews((prev) => [payload, ...prev]);
    setNewsForm({ title: "", news_date: "", location: "", category: "", description: "" });
  }

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 pb-16">
      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Events</h2>
          <p className="text-sm text-muted-foreground">Create and manage upcoming events.</p>
        </div>
        <form onSubmit={addEvent} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Name" value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} required />
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Date (YYYY-MM-DD)" value={eventForm.dates} onChange={(e) => setEventForm({ ...eventForm, dates: e.target.value })} />
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Type" value={eventForm.event_type} onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })} />
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 sm:col-span-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Target audience" value={eventForm.target_audience} onChange={(e) => setEventForm({ ...eventForm, target_audience: e.target.value })} />
          <textarea className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 sm:col-span-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-all duration-200 border border-primary/20">Add event</button>
          </div>
        </form>

        <hr className="mt-5"/>

        <div className="divide-y">
          {events.map((e) => (
            <div key={e.id} className="py-3 flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">{e.name}</p>
                <p className="text-sm text-gray-700">{e.dates} • {e.location} • {e.event_type}</p>
                {e.description && <p className="text-sm text-gray-800 mt-1">{e.description}</p>}
              </div>
               <span className="text-xs text-gray-700">{new Date(e.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">News</h2>
          <p className="text-sm text-muted-foreground">Publish product or company updates.</p>
        </div>
        <form onSubmit={addNews} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Title" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} required />
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Date (YYYY-MM-DD)" value={newsForm.news_date} onChange={(e) => setNewsForm({ ...newsForm, news_date: e.target.value })} />
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Category" value={newsForm.category} onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })} />
          <input className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Location" value={newsForm.location} onChange={(e) => setNewsForm({ ...newsForm, location: e.target.value })} />
          <textarea className="rounded-2xl border border-border bg-background/80 backdrop-blur-md text-foreground placeholder:text-muted-foreground px-3 py-2 sm:col-span-2 outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200" placeholder="Description" value={newsForm.description} onChange={(e) => setNewsForm({ ...newsForm, description: e.target.value })} />
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-foreground px-4 py-2 text-background hover:bg-foreground/90 transition-all duration-200 border border-foreground/20">Publish</button>
          </div>
        </form>

        <hr className="mt-5"/>

        <div className="divide-y">
          {news.map((n) => (
            <div key={n.id} className="py-3">
              <p className="font-medium text-gray-900">{n.title}</p>
              <p className="text-sm text-gray-700">{n.news_date} • {n.category} • {n.location}</p>
              {n.description && <p className="text-sm text-gray-800 mt-1">{n.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
