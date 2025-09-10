'use client';

import Image from 'next/image';
import { FaCalendarAlt } from 'react-icons/fa';
import { formatDate } from '@/utils/dateUtils';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

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
      className="bg-card/80 border border-border/20 rounded-2xl hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-[1.01]"
      onClick={onClick}
    >
      <div className="flex h-32">
        {/* Image Section */}
        <div className="relative w-48 h-full overflow-hidden flex-shrink-0 rounded-l-2xl">
          <Image
            src={imageUrl || defaultImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-300"
            sizes="192px"
            unoptimized
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>

            <div className="text-muted-foreground text-sm overflow-hidden">
              {description ? (
                <div className="line-clamp-2">
                  <MarkdownRenderer
                    content={description}
                    compact={true}
                    className="[&>*]:my-0 [&_p]:my-0 [&_p]:leading-tight"
                  />
                </div>
              ) : (
                'No description available'
              )}
            </div>
          </div>

          {/* Date - Discrete */}
          {news_date && (
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <FaCalendarAlt className="w-3 h-3 mr-1.5 text-primary/70" />
              <span className="font-medium">{formatDate(news_date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
