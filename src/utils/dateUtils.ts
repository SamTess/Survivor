/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Check if a date is in the future
 * @param dateString - ISO date string
 * @returns True if date is upcoming, false otherwise
 */
export const isUpcomingDate = (dateString: string): boolean => {
  return new Date(dateString) > new Date();
};
