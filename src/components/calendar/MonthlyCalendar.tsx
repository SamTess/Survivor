'use client';

import { useMemo, useState, Fragment } from 'react';
import { ChevronLeft, ChevronRight, X as CloseIcon } from 'lucide-react';
import type { EventApiResponse } from '@/domain/interfaces/Event';
import EventCard from '@/components/cards/EventCard';

type MonthlyCalendarProps = {
  events: EventApiResponse[];
  initialDate?: Date;
  onMonthChange?: (date: Date) => void;
};

function toLocalYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// Monday = 0 ... Sunday = 6
function dayIndexMondayFirst(date: Date) {
  return (date.getDay() + 6) % 7;
}

function getCalendarRange(date: Date) {
  const start = startOfMonth(date);
  const startPad = dayIndexMondayFirst(start);
  const gridStart = addDays(start, -startPad);

  const end = endOfMonth(date);
  const endPad = 6 - dayIndexMondayFirst(end);
  const gridEnd = addDays(end, endPad);

  const days: Date[] = [];
  for (let d = new Date(gridStart); d <= gridEnd; d = addDays(d, 1)) {
    days.push(new Date(d));
  }
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return { weeks };
}

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getChipClass(eventType?: string) {
  const t = (eventType ?? '').trim().toLowerCase();
  if (/(network|réseau|networking|meetup)/.test(t)) return 'event-chip event-chip--networking';
  if (/(workshop|atelier|hands?-?on)/.test(t)) return 'event-chip event-chip--workshop';
  if (/(conf|conference|sommet|summit|forum)/.test(t)) return 'event-chip event-chip--conference';
  if (/(webinar|en ligne|online)/.test(t)) return 'event-chip event-chip--webinar';
  if (/(pitch|demo|demoday)/.test(t)) return 'event-chip event-chip--pitch';
  return 'event-chip event-chip--other';
}

function parseEventDate(value?: string): Date | null {
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
}

export default function MonthlyCalendar({ events, initialDate, onMonthChange }: MonthlyCalendarProps) {
  const [viewDate, setViewDate] = useState<Date>(initialDate ?? new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventApiResponse | null>(null);
  const [selectedDay, setSelectedDay] = useState<{ dateKey: string; events: EventApiResponse[] } | null>(null);

  const { weeks } = useMemo(() => getCalendarRange(viewDate), [viewDate]);

  const monthLabel = useMemo(() => {
    return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventApiResponse[]>();
    for (const e of events || []) {
      const d = parseEventDate(e?.dates);
      if (!d) continue;
      const key = toLocalYMD(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => `${a.event_type ?? ''}${a.name ?? ''}`.localeCompare(`${b.event_type ?? ''}${b.name ?? ''}`));
      map.set(k, arr);
    }
    return map;
  }, [events]);

  function changeMonth(delta: number) {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);
    setViewDate(next);
    onMonthChange?.(next);
  }

  const todayKey = toLocalYMD(new Date());

  return (
    <div className="bg-card/50 border border-border/20 rounded-2xl p-3 md:p-5 mb-7">
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="px-3 py-2 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-primary/5 text-sm"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 text-center font-semibold text-lg capitalize select-none">{monthLabel}</div>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="px-3 py-2 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-primary/5 text-sm"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-2">
        <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground w-full">
          {weekdayLabels.map((lbl) => (
            <div key={lbl} className="px-2 py-1 text-left font-medium">{lbl}</div>
          ))}
        </div>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1 w-full">
          {weeks.map((week, wi) => (
            <Fragment key={wi}>
              {week.map((day, di) => {
                const key = toLocalYMD(day);
                const inMonth = day.getMonth() === viewDate.getMonth();
                const isToday = key === todayKey;
                const items = eventsByDay.get(key) ?? [];
                return (
                  <div
                    key={`${wi}-${di}`}
                    className={[
                      'relative h-32 md:h-36 lg:h-44 rounded-xl border p-1 md:p-1 flex flex-col gap-2 overflow-hidden',
                      'bg-background/60 border-border/30',
                      inMonth ? 'opacity-100' : 'opacity-60',
                      isToday ? 'ring-2 ring-primary/40' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{day.getDate()}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1 overflow-auto pr-1">
                      {items.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground/50">No events</div>
                      ) : items.length > 2 ? (
                        <button
                          type="button"
                          className={`event-chip event-chip--other w-full text-left px-2 py-1 cursor-pointer hover:opacity-90 transition`}
                          onClick={() => { setSelectedDay({ dateKey: key, events: items }); setSelectedEvent(null); }}
                          title={`${items.length} events on this day`}
                        >
                          <span className="text-[11px] font-medium">{items.length} events</span>
                        </button>
                      ) : (
                        items.map((ev) => (
                          <div
                            key={ev.id}
                            className={`${getChipClass(ev.event_type)} w-full text-left px-1 py-0.5 cursor-pointer hover:opacity-90 transition`}
                            title={`${ev.event_type ?? ''} • ${ev.location ?? ''} • ${ev.name ?? ''}`}
                            onClick={() => setSelectedEvent(ev)}
                          >
                            <div className="text-[11px] leading-4">
                              <span className="block truncate">{ev.event_type ?? 'Type'}</span>
                              <span className="block truncate">{ev.location ?? 'Location'}</span>
                              <span className="block truncate font-medium">{ev.name ?? 'Name'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedEvent(null)} />
          <div className="relative z-10 w-full max-w-xl">
            <div className="absolute -top-10 right-0 flex items-center gap-2">
              <button
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-background/70 border border-border/40 hover:border-primary/50 hover:bg-primary/5 text-sm"
                onClick={() => setSelectedEvent(null)}
              >
                <CloseIcon className="w-4 h-4" />
                Close
              </button>
            </div>
            <EventCard
              id={selectedEvent.id}
              name={selectedEvent.name}
              dates={selectedEvent.dates}
              location={selectedEvent.location}
              description={selectedEvent.description}
              event_type={selectedEvent.event_type}
              target_audience={selectedEvent.target_audience}
              imageUrl={selectedEvent.image_url}
            />
          </div>
        </div>
      )}

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedDay(null)} />
          <div className="relative z-10 w-full max-w-3xl bg-background/95 rounded-2xl border border-border/40 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">
                {new Date(selectedDay.dateKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <button
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-background/70 border border-border/40 hover:border-primary/50 hover:bg-primary/5 text-sm"
                onClick={() => setSelectedDay(null)}
              >
                <CloseIcon className="w-4 h-4" />
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-auto pr-1">
              {selectedDay.events.map((ev) => (
                <EventCard
                  key={ev.id}
                  id={ev.id}
                  name={ev.name}
                  dates={ev.dates}
                  location={ev.location}
                  description={ev.description}
                  event_type={ev.event_type}
                  target_audience={ev.target_audience}
                  imageUrl={ev.image_url}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
