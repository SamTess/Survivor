'use client';

import Image from 'next/image';
import { FaCalendarAlt } from 'react-icons/fa';
import { formatDate } from '@/utils/dateUtils';

interface NewsCardProps {
  id: number;
  title: string;
  news_date?: string;
  location?: string;
  category?: string;
  startup_id?: number;
  description?: string;
  imageUrl?: string;
  onClick?: () => void;
}

export default function NewsCard({
  title,
  news_date,
  description,
  imageUrl,
  onClick,
}: NewsCardProps) {

  const defaultImage = '/logo.png';

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex h-32">
        {/* Image Section */}
        <div className="relative w-48 h-full overflow-hidden flex-shrink-0">
          <Image
            src={imageUrl || defaultImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="192px"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
              {title}
            </h3>

            <p className="text-gray-600 text-sm line-clamp-2">
              {description || 'No description available'}
            </p>
          </div>

          {/* Date - Discrete */}
          {news_date && (
            <div className="flex items-center text-xs text-gray-400 mt-2">
              <FaCalendarAlt className="w-3 h-3 mr-1" />
              <span>{formatDate(news_date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
