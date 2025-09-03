/**
 * Get Tailwind CSS classes for news category styling
 * @param category - News category string
 * @returns CSS classes for category badge
 */
export const getNewsCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'funding':
      return 'bg-green-100 text-green-800';
    case 'partnership':
      return 'bg-blue-100 text-blue-800';
    case 'award':
      return 'bg-yellow-100 text-yellow-800';
    case 'product launch':
      return 'bg-purple-100 text-purple-800';
    case 'expansion':
      return 'bg-orange-100 text-orange-800';
    case 'recognition':
      return 'bg-pink-100 text-pink-800';
    case 'acquisition':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get Tailwind CSS classes for event type styling
 * @param type - Event type string
 * @returns CSS classes for event type badge
 */
export const getEventTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'pitch':
      return 'bg-red-100 text-red-800';
    case 'webinar':
      return 'bg-blue-100 text-blue-800';
    case 'workshop':
      return 'bg-green-100 text-green-800';
    case 'conference':
      return 'bg-purple-100 text-purple-800';
    case 'networking':
      return 'bg-orange-100 text-orange-800';
    case 'summit':
      return 'bg-indigo-100 text-indigo-800';
    case 'panel':
      return 'bg-pink-100 text-pink-800';
    case 'expo':
      return 'bg-yellow-100 text-yellow-800';
    case 'competition':
      return 'bg-emerald-100 text-emerald-800';
    case 'masterclass':
      return 'bg-violet-100 text-violet-800';
    case 'educational':
      return 'bg-cyan-100 text-cyan-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
