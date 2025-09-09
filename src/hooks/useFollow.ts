'use client';

import { useState, useEffect } from 'react';
import { ContentType, EventType } from '@/domain/enums/Analytics';

interface UseFollowProps {
  contentType: ContentType;
  contentId: number;
  initialFollowerCount?: number;
  userId?: number | null;
  sessionId?: string | null;
}

export const useFollow = ({
  contentType,
  contentId,
  initialFollowerCount = 0,
  userId,
  sessionId
}: UseFollowProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/follows/status?contentType=${contentType}&contentId=${contentId}&userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [contentType, contentId, userId]);

  const toggleFollow = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const newIsFollowing = !isFollowing;

    setIsFollowing(newIsFollowing);
    setFollowerCount((prev: number) => newIsFollowing ? prev + 1 : prev - 1);

    try {
      await fetch('/api/analytics/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sessionId,
          eventType: newIsFollowing ? EventType.FOLLOW : EventType.UNFOLLOW,
          contentType,
          contentId,
          metadata: { action: newIsFollowing ? 'follow' : 'unfollow' },
        }),
      });

      const response = await fetch('/api/follows', {
        method: newIsFollowing ? 'POST' : 'DELETE',
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
          // Already following
          setIsFollowing(true);
          setFollowerCount((prev: number) => (newIsFollowing ? prev - 1 : prev + 1));
          return;
        }
        // Revert optimistic update silently
        setIsFollowing(!newIsFollowing);
        setFollowerCount((prev: number) => (newIsFollowing ? prev - 1 : prev + 1));
        return;
      }

      const data = await response.json();
      setFollowerCount(data.followerCount);

  } catch {
      // Network or unexpected error: revert silently
      setIsFollowing(!newIsFollowing);
      setFollowerCount((prev: number) => (newIsFollowing ? prev - 1 : prev + 1));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFollowing,
    followerCount,
    toggleFollow,
    isLoading
  };
};
