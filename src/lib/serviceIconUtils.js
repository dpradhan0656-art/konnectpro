/**
 * Service/Category se related emoji ya icon dene ke liye.
 * Jahan bhi khali box ya generic icon hai, yahan se relevant emoji milega.
 */
const CATEGORY_EMOJI_MAP = {
  ac: '❄️',
  cooling: '❄️',
  air: '💨',
  clean: '🧹',
  wash: '🧼',
  paint: '🎨',
  plumb: '🔧',
  water: '💧',
  ro: '💧',
  electr: '⚡',
  light: '💡',
  carpen: '🪚',
  wood: '🪵',
  salon: '💇',
  hair: '✂️',
  beauty: '💄',
  spa: '🧖',
  massage: '💆',
  car: '🚗',
  bike: '🏍️',
  appliance: '🔌',
  pest: '🐛',
  repair: '🔧',
  service: '🛠️',
};

/** Category name se relevant emoji return karta hai */
export function getServiceEmoji(categoryOrName = '') {
  if (!categoryOrName || typeof categoryOrName !== 'string') return '🛠️';
  const lower = categoryOrName.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return '🛠️';
}

/** Check karta hai value valid image URL hai ya emoji/text */
export function isImageUrl(value) {
  if (!value || typeof value !== 'string') return false;
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/images/')
  );
}
