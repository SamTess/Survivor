'use client';

import { useState, useEffect } from 'react';
import { ContentType, EventType } from '@/domain/enums/Analytics';

interface UseLikeProps {
  contentType: ContentType;
  contentId: number;
  initialLikeCount?: number;
  userId?: number | null;
  sessionId?: string | null;
}

export const useLike = ({
  contentType,
  contentId,
  initialLikeCount = 0,
  userId,
  sessionId
}: UseLikeProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/likes/status?contentType=${contentType}&contentId=${contentId}&userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.isLiked);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [contentType, contentId, userId]);

  const toggleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const newIsLiked = !isLiked;

    setIsLiked(newIsLiked);
    setLikeCount((prev: number) => newIsLiked ? prev + 1 : prev - 1);

    try {
      await fetch('/api/analytics/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sessionId,
          eventType: newIsLiked ? EventType.LIKE : EventType.UNFOLLOW,
          contentType,
          contentId,
          metadata: { action: newIsLiked ? 'like' : 'unlike' },
        }),
      });

      const response = await fetch('/api/likes', {
        method: newIsLiked ? 'POST' : 'DELETE',
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
        throw new Error('Failed to update like status');
      }

      const data = await response.json();
      setLikeCount(data.likeCount);

    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(!newIsLiked);
      setLikeCount((prev: number) => newIsLiked ? prev - 1 : prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLiked,
    likeCount,
    toggleLike,
    isLoading
  };
};
