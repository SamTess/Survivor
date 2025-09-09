"use client";

import React from 'react';
import { UserAvatar } from './UserAvatar';
import { Card, CardContent } from './card';
import { normalizeRole, type UserRole } from '@/utils/roleUtils';

interface UserCardProps {
  id: number;
  name: string;
  role: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export function UserCard({
  id,
  name,
  role,
  className = '',
  size = 'md',
  interactive = false,
  onClick
}: UserCardProps) {
  const normalizedRole = normalizeRole(role);

  const getRoleColor = (userRole: UserRole): string => {
    switch (userRole) {
      case 'founder':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'investor':
        return 'bg-accent/10 text-accent border border-accent/20';
      case 'admin':
        return 'bg-secondary/10 text-secondary border border-secondary/20';
      case 'user':
      default:
        return 'bg-muted/50 text-foreground border border-border/20';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          avatar: 40,
          name: 'text-sm font-medium',
          role: 'text-xs'
        };
      case 'lg':
        return {
          card: 'p-6',
          avatar: 64,
          name: 'text-lg font-semibold',
          role: 'text-sm'
        };
      case 'md':
      default:
        return {
          card: 'p-4',
          avatar: 48,
          name: 'text-base font-medium',
          role: 'text-xs'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const roleColorClasses = getRoleColor(normalizedRole);

  return (
    <Card
      className={`
        bg-card/80 backdrop-blur-md border-border/20
        transition-all duration-300
        ${interactive ? 'hover:shadow-lg hover:border-primary/20 hover:scale-[1.02] cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <CardContent className={sizeClasses.card}>
        <div className="flex items-center space-x-3">
          {/* User Avatar */}
          <UserAvatar
            uid={id}
            name={name}
            size={sizeClasses.avatar}
            className="flex-shrink-0"
          />

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3
              className={`${sizeClasses.name} text-foreground truncate`}
              title={name}
            >
              {name}
            </h3>
            <span
              className={`
                inline-flex items-center px-2 py-0.5 rounded-full font-medium backdrop-blur-md
                ${sizeClasses.role} ${roleColorClasses}
              `}
            >
              {normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
