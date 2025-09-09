'use client';

import { useState, useEffect } from 'react';
import { ContentType, EventType } from '@/domain/enums/Analytics';

interface UseBookmarkProps {
  contentType: ContentType;
  contentId: number;
  initialBookmarkCount?: number;
  userId?: number | null;
  sessionId?: string | null;
}

export const useBookmark = ({
  contentType,
  contentId,
  initialBookmarkCount = 0,
  userId,
  sessionId
}: UseBookmarkProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/bookmarks/status?contentType=${contentType}&contentId=${contentId}&userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setIsBookmarked(data.isBookmarked);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [contentType, contentId, userId]);

  const toggleBookmark = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const newIsBookmarked = !isBookmarked;

    setIsBookmarked(newIsBookmarked);
    setBookmarkCount((prev: number) => newIsBookmarked ? prev + 1 : prev - 1);

    try {
      await fetch('/api/analytics/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sessionId,
          eventType: EventType.BOOKMARK,
          contentType,
          contentId,
          metadata: { action: newIsBookmarked ? 'bookmark' : 'unbookmark' },
        }),
      });

      const response = await fetch('/api/bookmarks', {
        method: newIsBookmarked ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          contentType,
          contentId,
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          // Already bookmarked
          setIsBookmarked(true);
          setBookmarkCount((prev: number) => (newIsBookmarked ? prev - 1 : prev + 1));
          return;
        }
        // Revert optimistic update silently
        setIsBookmarked(!newIsBookmarked);
        setBookmarkCount((prev: number) => (newIsBookmarked ? prev - 1 : prev + 1));
        return;
      }

      const data = await response.json();
      setBookmarkCount(data.bookmarkCount);

  } catch {
      // Network or unexpected error: revert silently
      setIsBookmarked(!newIsBookmarked);
      setBookmarkCount((prev: number) => (newIsBookmarked ? prev - 1 : prev + 1));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isBookmarked,
    bookmarkCount,
    toggleBookmark,
    isLoading
  };
};
