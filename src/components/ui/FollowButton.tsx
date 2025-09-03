'use client';

import React from 'react';
import { useFollow } from '@/hooks/useFollow';
import { ContentType } from '@/domain/enums/Analytics';

interface FollowButtonProps {
  contentType: ContentType;
  contentId: number;
  initialFollowerCount?: number;
  userId?: number | null;
  sessionId?: string | null;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal';
  className?: string;
}

export default function FollowButton({
  contentType,
  contentId,
  initialFollowerCount = 0,
  userId,
  sessionId,
  size = 'medium',
  variant = 'default',
  className = ''
}: FollowButtonProps) {
  const { isFollowing, followerCount, toggleFollow, isLoading } = useFollow({
    contentType,
    contentId,
    initialFollowerCount,
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
      console.log('User must be logged in to follow');
      return;
    }
    toggleFollow();
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          flex items-center gap-1 transition-colors duration-200
          ${isFollowing ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        <svg
          className={`${iconSizes[size]} transition-transform duration-200 ${isFollowing ? 'scale-110' : ''}`}
          fill={isFollowing ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className={
          size === 'small' ? 'text-xs' :
          size === 'medium' ? 'text-sm' :
          'text-base'
        }>
          {followerCount}
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
        ${isFollowing
          ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <svg
        className={`${iconSizes[size]} transition-transform duration-200 ${isFollowing ? 'scale-110' : ''}`}
        fill={isFollowing ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <span className="font-medium">
        {isFollowing ? `Following (${followerCount})` : `Follow (${followerCount})`}
      </span>
      {isLoading && (
        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
}
