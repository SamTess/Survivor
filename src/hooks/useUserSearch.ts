import { useState, useEffect, useCallback } from 'react';
import { User } from '@/domain/interfaces/User';

interface SearchResponse {
  success: boolean;
  data: User[];
  error?: string;
  searchTerm?: string;
  filter?: { role?: string };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseUserSearchOptions {
  /** Minimum query length before search is triggered */
  minQueryLength?: number;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Maximum number of results to fetch */
  maxResults?: number;
  /** Whether to automatically search on query/role change */
  autoSearch?: boolean;
}

interface UseUserSearchReturn {
  /** Search results */
  users: User[];
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Function to manually trigger search */
  searchUsers: (query: string, role?: string) => Promise<void>;
  /** Function to clear results and error */
  clearResults: () => void;
  /** Total count of results (if available) */
  totalCount?: number;
  /** The current search term */
  searchTerm?: string;
}

/**
 * Custom hook for searching users via the API
 * Provides debounced search, loading states, and error handling
 */
export function useUserSearch(
  query: string,
  role?: string,
  options: UseUserSearchOptions = {}
): UseUserSearchReturn {
  const {
    minQueryLength = 2,
    debounceMs = 300,
    maxResults = 20,
    autoSearch = true
  } = options;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState<string | undefined>();

  const searchUsers = useCallback(
    async (searchQuery: string, searchRole?: string) => {
      if (searchQuery.length < minQueryLength) {
        setUsers([]);
        setError(null);
        setTotalCount(undefined);
        setSearchTerm(undefined);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          search: searchQuery,
          limit: maxResults.toString()
        });

        if (searchRole) {
          params.append('role', searchRole);
        }

        const response = await fetch(`/api/users?${params}`);
        const data: SearchResponse = await response.json();

        if (data.success) {
          setUsers(data.data || []);
          setTotalCount(data.pagination?.total);
          setSearchTerm(data.searchTerm);
        } else {
          setError(data.error || 'Failed to search users');
          setUsers([]);
          setTotalCount(undefined);
          setSearchTerm(undefined);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search users';
        setError(errorMessage);
        setUsers([]);
        setTotalCount(undefined);
        setSearchTerm(undefined);
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    },
    [minQueryLength, maxResults]
  );

  const clearResults = useCallback(() => {
    setUsers([]);
    setError(null);
    setLoading(false);
    setTotalCount(undefined);
    setSearchTerm(undefined);
  }, []);

  // Auto search with debouncing
  useEffect(() => {
    if (!autoSearch) return;

    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query.trim(), role);
      } else {
        clearResults();
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, role, searchUsers, clearResults, debounceMs, autoSearch]);

  return {
    users,
    loading,
    error,
    searchUsers,
    clearResults,
    totalCount,
    searchTerm
  };
}

/**
 * Hook for advanced user search with pagination support
 */
export function useUserSearchPaginated(
  query: string,
  role?: string,
  page: number = 1,
  limit: number = 10
) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const searchUsers = useCallback(
    async (searchQuery: string, searchRole?: string, searchPage = 1, searchLimit = 10) => {
      if (searchQuery.length < 2) {
        setUsers([]);
        setError(null);
        setPagination(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          search: searchQuery,
          page: searchPage.toString(),
          limit: searchLimit.toString()
        });

        if (searchRole) {
          params.append('role', searchRole);
        }

        const response = await fetch(`/api/users?${params}`);
        const data: SearchResponse = await response.json();

        if (data.success) {
          setUsers(data.data || []);
          setPagination(data.pagination || null);
        } else {
          setError(data.error || 'Failed to search users');
          setUsers([]);
          setPagination(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search users';
        setError(errorMessage);
        setUsers([]);
        setPagination(null);
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query.trim(), role, page, limit);
      } else {
        setUsers([]);
        setError(null);
        setPagination(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, role, page, limit, searchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    searchUsers,
    clearResults: () => {
      setUsers([]);
      setError(null);
      setPagination(null);
    }
  };
}
