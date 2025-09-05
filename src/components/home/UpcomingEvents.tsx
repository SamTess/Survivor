"use client";

import EventCard from "@/components/cards/EventCard";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { EventApiResponse } from "@/domain/interfaces/Event";

export function UpcomingEvents() {
  const [events, setEvents] = useState<EventApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/events?upcoming=true&limit=6');
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data)) {
            setEvents(json.data.slice(0,3));
        }
  } catch {
        if (!cancelled) setError('Impossible de charger les événements');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background via-muted/40 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Calendar className="h-5 w-5" /></div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Upcoming Events</h2>
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Chargement...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {events.map(e => (
              <EventCard key={e.id} id={e.id} name={e.name} dates={e.dates} location={e.location} description={e.description} event_type={e.event_type} target_audience={e.target_audience} imageUrl={e.image_url} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
