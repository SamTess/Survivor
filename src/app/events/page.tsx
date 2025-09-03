'use client';

import { useState, useEffect } from 'react';
import EventCard from '@/components/cards/EventCard';
import { EventApiResponse } from '@/domain/interfaces/Event';

// TODO REMOVE
import eventsData from '@/mocks/events.json';

export default function EventsPage() {
  const [events, setEvents] = useState<EventApiResponse[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventApiResponse[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    setEvents(eventsData);
    setFilteredEvents(eventsData);
  }, []);

  useEffect(() => {
    let filtered = [...events];

    if (selectedFilter === 'upcoming') {
      filtered = filtered.filter(event => event.dates && new Date(event.dates) > new Date());
    } else if (selectedFilter === 'past') {
      filtered = filtered.filter(event => event.dates && new Date(event.dates) <= new Date());
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.event_type && event.event_type.toLowerCase() === selectedType.toLowerCase());
    }

    setFilteredEvents(filtered);
  }, [events, selectedFilter, selectedType]);

  // Get unique event types for filter dropdown
  const eventTypes = [...new Set(events.map(event => event.event_type).filter(Boolean))];

  return (
    <div className="h-screen bg-gray-50 pt-14 overflow-y-auto">
      <div className="px-4 py-8 max-w-[70rem] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Events</h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover upcoming events, workshops, and networking opportunities in our startup ecosystem.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Time Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by time:</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'upcoming' | 'past')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all" className="text-gray-900">All Events</option>
                <option value="upcoming" className="text-gray-900">Upcoming</option>
                <option value="past" className="text-gray-900">Past Events</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by type:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all" className="text-gray-900">All Types</option>
                {eventTypes.map(type => (
                  <option key={type} value={type} className="text-gray-900">{type}</option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500 ml-auto">
              Showing {filteredEvents.length} of {events.length} events
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
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
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No events found</div>
            <p className="text-gray-500">
              {selectedFilter !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your filters to see more events.'
                : 'Check back later for upcoming events.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}