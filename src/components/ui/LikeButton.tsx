'use client';

import React from 'react';
import { useLike } from '@/hooks/useLike';
import { ContentType } from '@/domain/enums/Analytics';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  contentType: ContentType;
  contentId: number;
  initialLikeCount?: number;
  userId?: number | null;
  sessionId?: string | null;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal';
  className?: string;
}

export default function LikeButton({
  contentType,
  contentId,
  initialLikeCount = 0,
  userId,
  sessionId,
  size = 'medium',
  variant = 'default',
  className = ''
}: LikeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const effectiveUserId = userId ?? user?.id ?? null;
  const { isLiked, likeCount, toggleLike, isLoading } = useLike({
    contentType,
    contentId,
    initialLikeCount,
    userId: effectiveUserId ?? undefined,
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
  if (!effectiveUserId) {
      router.push('/login');
      return;
    }
    toggleLike();
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          flex items-center gap-1 transition-colors duration-200
          ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        <svg
          className={`${iconSizes[size]} transition-transform duration-200 ${isLiked ? 'scale-110' : ''}`}
          fill={isLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className={
          size === 'small' ? 'text-xs' :
          size === 'medium' ? 'text-sm' :
          'text-base'
        }>
          {likeCount}
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
        ${isLiked
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <svg
        className={`${iconSizes[size]} transition-transform duration-200 ${isLiked ? 'scale-110' : ''}`}
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="font-medium">{likeCount}</span>
      {isLoading && (
        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
}
