'use client';

import React from 'react';
import { useBookmark } from '@/hooks/useBookmark';
import { ContentType } from '@/domain/enums/Analytics';

interface BookmarkButtonProps {
  contentType: ContentType;
  contentId: number;
  initialBookmarkCount?: number;
  userId?: number | null;
  sessionId?: string | null;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal';
  className?: string;
}

export default function BookmarkButton({
  contentType,
  contentId,
  initialBookmarkCount = 0,
  userId,
  sessionId,
  size = 'medium',
  variant = 'default',
  className = ''
}: BookmarkButtonProps) {
  const { isBookmarked, bookmarkCount, toggleBookmark, isLoading } = useBookmark({
    contentType,
    contentId,
    initialBookmarkCount,
    userId,
    sessionId
  });

  const sizeClasses = {
    small: 'text-sm px-2 py-1',
    medium: 'text-base px-3 py-2',
    large: 'text-lg px-4 py-3'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) {
      return;
    }
    toggleBookmark();
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          flex items-center gap-1 transition-colors duration-200
          ${isBookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        <svg
          className={`${iconSizes[size]} transition-transform duration-200 ${isBookmarked ? 'scale-110' : ''}`}
          fill={isBookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <span className={
          size === 'small' ? 'text-xs' :
          size === 'medium' ? 'text-sm' :
          'text-base'
        }>
          {bookmarkCount}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        flex items-center gap-2 rounded-full border transition-all duration-200
        ${isBookmarked
          ? 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <svg
        className={`${iconSizes[size]} transition-transform duration-200 ${isBookmarked ? 'scale-110' : ''}`}
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      <span className="font-medium">{bookmarkCount}</span>
      {isLoading && (
        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
}
