/**
 * Get Tailwind CSS classes for news category styling
 * @param category - News category string
 * @returns CSS classes for category badge
 */
export const getNewsCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'funding':
      return 'admin-category-funding';
    case 'partnership':
      return 'admin-category-partnership';
    case 'award':
      return 'admin-category-award';
    case 'product launch':
      return 'admin-category-launch';
    case 'expansion':
      return 'admin-category-expansion';
    case 'recognition':
      return 'admin-category-recognition';
    case 'acquisition':
      return 'admin-category-acquisition';
    default:
      return 'admin-category-default';
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
      return 'admin-event-pitch';
    case 'webinar':
      return 'admin-event-webinar';
    case 'workshop':
      return 'admin-event-workshop';
    case 'conference':
      return 'admin-event-conference';
    case 'networking':
      return 'admin-event-networking';
    case 'summit':
      return 'admin-event-summit';
    case 'panel':
      return 'admin-event-panel';
    case 'expo':
      return 'admin-event-expo';
    case 'competition':
      return 'admin-event-competition';
    case 'masterclass':
      return 'admin-event-masterclass';
    case 'educational':
      return 'admin-event-educational';
    default:
      return 'admin-event-default';
  }
};
