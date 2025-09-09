"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from './input';
import { UserCard } from './UserCard';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { useUserSearch } from '@/hooks/useUserSearch';
import { User } from '@/domain/interfaces/User';
import { Search, Loader2, X, Filter, Users } from 'lucide-react';

interface SearchUserProps {
  /** Callback when a user is selected */
  onUserSelect?: (user: User) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether to show role filter */
  showRoleFilter?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Size variant for user cards */
  cardSize?: 'sm' | 'md' | 'lg';
  /** Maximum number of results */
  maxResults?: number;
}

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'FOUNDER', label: 'Founder' },
  { value: 'INVESTOR', label: 'Investor' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'User' },
];

/**
 * SearchUser component that uses the useUserSearch hook
 * Provides a clean, lightweight search interface for finding users
 */
export function SearchUser({
  onUserSelect,
  placeholder = "Search users by name, email, or role...",
  showRoleFilter = true,
  className = '',
  cardSize = 'md',
  maxResults = 15
}: SearchUserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { users, loading, error, clearResults } = useUserSearch(
    searchQuery,
    selectedRole || undefined,
    { maxResults }
  );

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleUserClick = (user: User) => {
    // Call the onUserSelect callback if provided
    onUserSelect?.(user);
    // Navigate to the user's profile page
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
        <Card className="bg-card/80 backdrop-blur-md border-border/20">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Search Results
              {hasResults && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({users.length} found)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto px-3 pb-3">
            {error ? (
              <div className="text-center py-6">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            ) : showNoResults ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm">
                  No users found for "{searchQuery}"
                  {selectedRole && (
                    <span className="block mt-1">
                      with role "{ROLE_OPTIONS.find(r => r.value === selectedRole)?.label}"
                    </span>
                  )}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SearchUser;
