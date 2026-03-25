const CATEGORY_MAP = [
  { keys: ['plumb', 'water', 'ro', 'bath'], path: '/images/placeholders/categories/plumbing.svg' },
  { keys: ['elect', 'light', 'wiring'], path: '/images/placeholders/categories/electrical.svg' },
  { keys: ['clean', 'wash', 'housekeeping'], path: '/images/placeholders/categories/cleaning.svg' },
  { keys: ['beauty', 'salon', 'spa', 'hair'], path: '/images/placeholders/categories/beauty.svg' },
  { keys: ['ac', 'cool', 'appliance', 'repair'], path: '/images/placeholders/categories/appliance.svg' },
];

const SERVICE_MAP = [
  { keys: ['plumb', 'water', 'tap', 'drain'], path: '/images/placeholders/categories/plumbing.svg' },
  { keys: ['elect', 'light', 'switch', 'fan'], path: '/images/placeholders/categories/electrical.svg' },
  { keys: ['clean', 'wash', 'sofa', 'kitchen'], path: '/images/placeholders/categories/cleaning.svg' },
  { keys: ['beauty', 'salon', 'spa', 'hair', 'facial'], path: '/images/placeholders/categories/beauty.svg' },
  { keys: ['ac', 'cool', 'fridge', 'repair'], path: '/images/placeholders/categories/appliance.svg' },
];

export const DEFAULT_CATEGORY_FALLBACK = '/images/placeholders/categories/default.svg';
export const DEFAULT_SERVICE_FALLBACK = '/images/placeholders/categories/default.svg';

function pickByKeywords(input, map, fallback) {
  const text = String(input || '').toLowerCase();
  for (const item of map) {
    if (item.keys.some((k) => text.includes(k))) return item.path;
  }
  return fallback;
}

export function getCategoryFallbackImage(categoryName) {
  return pickByKeywords(categoryName, CATEGORY_MAP, DEFAULT_CATEGORY_FALLBACK);
}

export function getServiceFallbackImage(serviceOrCategoryName) {
  return pickByKeywords(serviceOrCategoryName, SERVICE_MAP, DEFAULT_SERVICE_FALLBACK);
}
