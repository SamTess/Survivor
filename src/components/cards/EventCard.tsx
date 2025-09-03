'use client';

import Image from 'next/image';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock } from 'react-icons/fa';
import { formatDate, isUpcomingDate } from '@/utils/dateUtils';
import { getEventTypeColor } from '@/utils/styleUtils';

interface EventCardProps {
  id: number;
  name: string;
  dates?: string;
  location?: string;
  description?: string;
  event_type?: string;
  target_audience?: string;
  imageUrl?: string;
}

export default function EventCard({
  name,
  dates,
  location,
  description,
  event_type,
  target_audience,
  imageUrl,
}: EventCardProps) {

  const defaultImage = '/logo.png';

  // (only if dates is provided)
  const isUpcoming = dates ? isUpcomingDate(dates) : false;

  return (
    <div className="bg-card/80 border border-border/20 rounded-2xl hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden group flex flex-col h-full hover:scale-[1.02]">
      {/* Image Section */}
      <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
        <Image
          src={imageUrl || defaultImage}
          alt={name}
          fill
          className="object-cover transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {event_type && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 backdrop-blur-md`}>
              {event_type}
            </span>
          )}
          {isUpcoming && dates && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/90 text-accent-foreground border border-accent/20 backdrop-blur-md">
              <FaClock className="w-3 h-3 mr-1" />
              Upcoming
            </span>
          )}
        </div>

        {/* Date and Location overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-background/30 backdrop-blur-xl border border-border/10 rounded-full p-1">
          <div className="flex items-center justify-between text-xs text-foreground">
            {dates && (
              <div className="flex items-center">
                <FaCalendarAlt className="w-3 h-3 mr-1.5 text-primary" />
                <span className="font-medium">{formatDate(dates)}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center">
                <FaMapMarkerAlt className="w-3 h-3 mr-1.5 text-primary" />
                <span className="font-medium truncate max-w-[120px]">{location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {name}
          </h3>

          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {description || 'No description available'}
          </p>

          {/* Target Audience */}
          {target_audience && (
            <div className="mb-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <FaUsers className="w-3 h-3 mr-1.5 text-primary/70" />
                <span className="font-medium text-foreground">Target:</span>
                <span className="ml-1 truncate">{target_audience}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-1 pt-1 border-t border-border/20">
          <button className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-xl hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200 text-sm font-medium border border-primary/20 backdrop-blur-md group">
            <span className="group-hover:text-primary-foreground transition-colors">
              {isUpcoming ? 'Register Now' : 'View Details'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
