'use client';

import Image from 'next/image';
import { FaCalendarAlt, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { formatDate } from '@/utils/dateUtils';
import { getNewsCategoryColor } from '@/utils/styleUtils';

interface NewsCardProps {
  id: number;
  title: string;
  news_date: string;
  location: string;
  category: string;
  startup_id: number;
  description: string;
  imageUrl?: string;
}

export default function NewsCard({
  title,
  news_date,
  location,
  category,
  description,
  imageUrl,
}: NewsCardProps) {

  const defaultImage = '/logo.png';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imageUrl || defaultImage}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNewsCategoryColor(category)}`}>
            <FaTag className="w-3 h-3 mr-1" />
            {category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
          {title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaCalendarAlt className="w-4 h-4 mr-1" />
              <span>{formatDate(news_date)}</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="w-4 h-4 mr-1" />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
