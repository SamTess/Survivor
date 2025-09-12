'use client';

import { useState, useEffect } from 'react';
import EventCard from '@/components/cards/EventCard';
import MonthlyCalendar from '@/components/calendar/MonthlyCalendar';
import { EventApiResponse } from '@/domain/interfaces/Event';

export default function EventsPage() {
  const [events, setEvents] = useState<EventApiResponse[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventApiResponse[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

  const parseEventDate = (value?: string): Date | null => {
    if (!value) return null;
    const m = value.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})(?:$|T)/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      return new Date(y, mo, d);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setEvents(result.data);
        } else {
          console.error('API returned invalid data structure:', result);
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = [...events];

    if (selectedFilter === 'upcoming') {
      const today = new Date(); today.setHours(0,0,0,0);
      filtered = filtered.filter(event => {
        const d = parseEventDate(event.dates);
        if (!d) return false;
        d.setHours(0,0,0,0);
        return d.getTime() > today.getTime();
      });
    } else if (selectedFilter === 'past') {
      const today = new Date(); today.setHours(0,0,0,0);
      filtered = filtered.filter(event => {
        const d = parseEventDate(event.dates);
        if (!d) return false;
        d.setHours(0,0,0,0);
        return d.getTime() <= today.getTime();
      });
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.event_type && event.event_type.toLowerCase() === selectedType.toLowerCase());
    }

    setFilteredEvents(filtered);
  }, [events, selectedFilter, selectedType]);

  const eventTypes = [...new Set(events.map(event => event.event_type).filter(Boolean))];

  return (
    <div className="h-screen bg-background pt-14 overflow-y-auto">
  <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 transition-all duration-300">Events</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover upcoming events, workshops, and networking opportunities in our startup ecosystem.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center bg-card/50 backdrop-blur-md border border-border/20 rounded-2xl p-6 transition-all duration-300">
            {/* Time Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-foreground">Filter by time:</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'upcoming' | 'past')}
                className="px-4 py-2 border border-border rounded-full text-sm text-foreground bg-background/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary hover:border-primary/50 transition-all duration-200"
              >
                <option value="all" className="text-foreground">All Events</option>
                <option value="upcoming" className="text-foreground">Upcoming</option>
                <option value="past" className="text-foreground">Past Events</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-foreground">Filter by type:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-border rounded-full text-sm text-foreground bg-background/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary hover:border-primary/50 transition-all duration-200"
              >
                <option value="all" className="text-foreground">All Types</option>
                {eventTypes.map(type => (
                  <option key={type} value={type} className="text-foreground">{type}</option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground ml-auto font-medium flex items-center gap-3">
              <span>Showing {filteredEvents.length} of {events.length} events</span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-full border text-sm ${viewMode === 'calendar' ? 'border-primary text-primary' : 'border-border text-foreground/80 hover:border-primary/50'}`}
              >
                Calendar
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-full border text-sm ${viewMode === 'list' ? 'border-primary text-primary' : 'border-border text-foreground/80 hover:border-primary/50'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <MonthlyCalendar events={filteredEvents} />
        )}

        {/* Events Grid */}
  {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Loading events...</div>
          </div>
  ) : viewMode === 'list' && filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                name={event.name}
                dates={event.dates}
                location={event.location}
                description={event.description}
                event_type={event.event_type}
                target_audience={event.target_audience}
                imageUrl={event.image_url}
              />
            ))}
          </div>
  ) : viewMode === 'list' ? (
          <div className="text-center py-12 bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl transition-all duration-300">
            <div className="text-muted-foreground text-lg mb-2 font-medium">No events found</div>
            <p className="text-muted-foreground/70">
              {selectedFilter !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your filters to see more events.'
                : 'Check back later for upcoming events.'}
            </p>
          </div>
  ) : null}
      </div>
    </div>
  );
}
