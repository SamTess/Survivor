"use client";

import EventCard from "@/components/cards/EventCard";
import events from "@/mocks/events.json";
import { Calendar } from "lucide-react";

export function UpcomingEvents() {
  const list = events.slice(0, 3);
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background via-muted/40 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Calendar className="h-5 w-5" /></div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Upcoming Events</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {list.map(e => (
            <EventCard key={e.id} id={e.id} name={e.name} dates={e.dates} location={e.location} description={e.description} event_type={e.event_type} target_audience={e.target_audience} />
          ))}
        </div>
      </div>
    </section>
  );
}
