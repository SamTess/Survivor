'use client';

import React, { useMemo, useState } from 'react';
import { EventApiResponse } from '@/domain/interfaces/Event';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface EventsCalendarProps {
  events: EventApiResponse[];
  onSelectDate?: (date: string | null) => void;
  selectedDate?: string | null;
}

const toISODate = (d: string) => {
  try {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return null;
    return dateObj.toISOString().split('T')[0];
  } catch {
    return null;
  }
};

const getEventTypeColor = (type?: string) => {
  if (!type) return 'border-gray-400';
  const t = type.toLowerCase();
  if (t.includes('workshop') || t.includes('work')) return 'border-blue-500';
  if (t.includes('meetup') || t.includes('meet')) return 'border-green-500';
  if (t.includes('conference') || t.includes('conf')) return 'border-purple-500';
  if (t.includes('webinar') || t.includes('web')) return 'border-amber-500';
  if (t.includes('hackathon') || t.includes('hack')) return 'border-pink-500';
  if (t.includes('networking') || t.includes('network')) return 'border-cyan-500';
  return 'border-primary';
};

export default function EventsCalendar({ events, onSelectDate, selectedDate }: EventsCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const eventsByDay = useMemo(() => {
    const map: Record<string, EventApiResponse[]> = {};
    events.forEach(ev => {
      if (!ev.dates) return;
      const iso = toISODate(ev.dates);
      if (!iso) return;
      if (!map[iso]) map[iso] = [];
      map[iso].push(ev);
    });
    return map;
  }, [events]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const cells: Array<{ date: Date | null }> = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day) });
  }

  const handlePrev = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNext = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const isSameDay = (d: Date, iso: string) => d.toISOString().split('T')[0] === iso;

  return (
    <div className="w-full rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrev} className="p-2 rounded-full hover:bg-accent/20 transition-colors" aria-label="Previous month">
          <FaChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold text-foreground capitalize">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={handleNext} className="p-2 rounded-full hover:bg-accent/20 transition-colors" aria-label="Next month">
          <FaChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2 text-xs font-medium text-muted-foreground">
        {weekDays.map(d => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell.date) return <div key={idx} className="h-32" />;

          const iso = cell.date.toISOString().split('T')[0];
          const dayEvents = eventsByDay[iso] || [];
          const isSelected = selectedDate === iso;
          const isToday = isSameDay(cell.date, today.toISOString().split('T')[0]);

          let cellClasses = 'relative group flex flex-col items-start justify-start h-32 rounded-xl border text-xs transition-all duration-200 overflow-hidden p-1';

          if (dayEvents.length > 0) {
            cellClasses += ' border-primary/40 bg-primary/10 hover:bg-primary/20';
          } else {
            cellClasses += ' border-border/30 hover:border-primary/40 hover:bg-accent/10';
          }

          if (isSelected) {
            cellClasses += ' ring-2 ring-primary shadow-md';
          }

          if (isToday) {
            cellClasses += ' bg-accent/30 border-accent/50';
          }

          return (
            <button
              key={iso}
              onClick={() => onSelectDate && onSelectDate(isSelected ? null : iso)}
              className={cellClasses}
            >
              <span className="text-foreground font-medium text-sm self-start mb-1">
                {cell.date.getDate()}
              </span>

              {dayEvents.length >= 3 ? (
                <span className="mt-auto mb-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary text-primary-foreground">
                  {dayEvents.length} Events
                </span>
              ) : dayEvents.length > 0 ? (
                <div className="flex-1 w-full space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event, eventIdx) => {
                    const eventTypeColorClass = getEventTypeColor(event.event_type);
                    return (
                      <div
                        key={`${event.id}-${eventIdx}`}
                        title={`${event.name} - ${event.event_type || 'Event'} - ${event.location || 'Location not specified'}`}
                        className={`w-full p-1 rounded border-l-2 ${eventTypeColorClass} bg-background/90 hover:bg-background transition-colors cursor-pointer shadow-sm`}
                      >
                        <div className="text-[9px] font-semibold text-foreground truncate">
                          {event.name}
                        </div>
                        {event.event_type && (
                          <div className="text-[8px] text-muted-foreground truncate">
                            {event.event_type}
                          </div>
                        )}
                        {event.location && (
                          <div className="text-[8px] text-muted-foreground truncate">
                            Location: {event.location}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[8px] text-muted-foreground text-center">
                      +{dayEvents.length - 2} more...
                    </div>
                  )}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-primary/60 border border-primary/40" />
          With events
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-accent/40 border border-accent/40" />
          Today
        </div>
        {selectedDate && (
          <button
            onClick={() => onSelectDate && onSelectDate(null)}
            className="ml-auto text-primary hover:underline"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
