"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCard } from './UserCard';
import { useUserSearch } from '@/hooks/useUserSearch';
import { User } from '@/domain/interfaces/User';
import { Search, Loader2, X, Users } from 'lucide-react';

interface SearchUserProps {
  onUserSelect?: (user: User) => void;
  placeholder?: string;
  showRoleFilter?: boolean;
  className?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  maxResults?: number;
}

export function SearchUser({
  onUserSelect,
  placeholder = "Search users by name, email, or role...",
  className = '',
  cardSize = 'md',
  maxResults = 15
}: SearchUserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { users, loading, error, clearResults } = useUserSearch(
    searchQuery,
    undefined,
    { maxResults }
  );

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleUserClick = (user: User) => {
    onUserSelect?.(user);
    router.push(`/profile/${user.id}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    clearResults();
  };

  const hasResults = users.length > 0;
  const showNoResults = searchQuery.length >= 2 && !loading && !hasResults && !error;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Input */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full pl-6 pr-10 py-2 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-200 relative z-10"
            />
            {/* Static underline */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-border" />
            {/* Animated underline */}
            <div
              className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-500 ease-out transform-gpu ${
                isFocused || searchQuery ? 'w-full scale-x-100' : 'w-full scale-x-0'
              } origin-right`}
            />
          </div>
          {searchQuery && !loading && (
            <button
              onClick={clearSearch}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {loading && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {(hasResults || showNoResults || error) && (
        <div className="">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Search Results</span>
            {hasResults && (
              <span className="text-xs text-muted-foreground">
                ({users.length} found)
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto overflow-x-clip scrollbar-none px-1 pb-2">
            {error ? (
              <div className="text-center py-6">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            ) : showNoResults ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm">
                  No users found for &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : hasResults ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    id={user.id}
                    name={user.name}
                    role={user.role}
                    size={cardSize}
                    interactive
                    onClick={() => handleUserClick(user)}
                    className="transition-all duration-200 hover:shadow-md"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchUser;
