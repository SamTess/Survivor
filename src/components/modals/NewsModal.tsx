'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { FaCalendarAlt, FaMapMarkerAlt, FaTimes, FaTag } from 'react-icons/fa';
import { formatDate } from '@/utils/dateUtils';
import { getNewsCategoryColor } from '@/utils/styleUtils';
import { NewsDetailApiResponse } from '@/domain/interfaces/News';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { useModalKeyboard } from '@/hooks/useAccessibility';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsItem: NewsDetailApiResponse | null;
}

export default function NewsModal({ isOpen, onClose, newsItem }: NewsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useModalKeyboard(isOpen, onClose, {
    closeOnEscape: true,
    trapFocus: true
  });

  if (!isOpen || !newsItem) return null;

  const defaultImage = '/logo.png';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-modal-title"
      aria-describedby="news-modal-content"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden focus:outline-none"
          tabIndex={-1}
        >
          {/* Close Button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Close news modal (Escape)"
            title="Close news modal (Escape)"
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
            <span className="sr-only">Close</span>
          </button>

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[90vh]">
            {/* Header Image */}
            <div className="relative h-64 w-full">
              <Image
                src={newsItem.image_url || defaultImage}
                alt={newsItem.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
              {newsItem.category && (
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getNewsCategoryColor(newsItem.category)}`}>
                    <FaTag className="w-3 h-3 mr-1" />
                    {newsItem.category}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Title */}
              <h1 id="news-modal-title" className="text-3xl font-bold text-gray-900 mb-4">
                {newsItem.title}
              </h1>

              {/* Meta Information */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                {newsItem.news_date && (
                  <div className="flex items-center">
                    <FaCalendarAlt className="w-4 h-4 mr-2" />
                    <span>{formatDate(newsItem.news_date)}</span>
                  </div>
                )}
                {newsItem.location && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                    <span>{newsItem.location}</span>
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div id="news-modal-content" className="prose prose-lg max-w-none">
                {newsItem.description ? (
                  <MarkdownRenderer
                    content={newsItem.description}
                    compact={false}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    No detailed description available for this news item.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Published on {newsItem.news_date ? formatDate(newsItem.news_date) : 'Unknown date'}
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Close news modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
