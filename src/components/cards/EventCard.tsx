'use client';

import Image from 'next/image';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock } from 'react-icons/fa';
import { formatDate, isUpcomingDate } from '@/utils/dateUtils';
import { getEventTypeColor } from '@/utils/styleUtils';

interface EventCardProps {
  id: number;
  name: string;
  dates: string;
  location: string;
  description: string;
  event_type: string;
  target_audience: string;
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
  // Default image if none provided
  const defaultImage = '/logo.png';
  
  // Check if event is upcoming or past
  const isUpcoming = isUpcomingDate(dates);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imageUrl || defaultImage}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event_type)}`}>
            {event_type}
          </span>
          {isUpcoming && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
              <FaClock className="w-3 h-3 mr-1" />
              Upcoming
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
          {name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {/* Target Audience */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FaUsers className="w-4 h-4 mr-2" />
            <span className="font-medium">Target:</span>
            <span className="ml-1">{target_audience}</span>
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaCalendarAlt className="w-4 h-4 mr-1" />
              <span>{formatDate(dates)}</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="w-4 h-4 mr-1" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium">
            {isUpcoming ? 'Register Now' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
