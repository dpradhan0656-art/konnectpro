import { filterServicesByCity } from './serviceCityUtils';
import { slugifyCategoryName } from '../utils/syncServiceData';

/**
 * Resolve Category Master row from URL slug (/category/:slug).
 */
export function matchCategoryBySlug(categories, urlSlug) {
  const slug = String(urlSlug || '').trim().toLowerCase();
  if (!slug || !Array.isArray(categories)) return null;

  return (
    categories.find((c) => String(c.slug || '').trim().toLowerCase() === slug) ||
    categories.find((c) => slugifyCategoryName(c.name) === slug) ||
    null
  );
}

/**
 * Load active categories once, then services for the slug-linked category name.
 */
export async function fetchServicesForCategorySlug(supabase, urlSlug, userCity = '') {
  const slug = String(urlSlug || '').trim().toLowerCase();

  if (slug === 'all') {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return filterServicesByCity(data || [], userCity);
  }

  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true);

  if (catErr) throw catErr;

  const matched = matchCategoryBySlug(categories, slug);

  if (matched?.name) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .eq('category', matched.name)
      .order('name', { ascending: true });

    if (error) throw error;
    const list = data || [];
    if (list.length > 0) return filterServicesByCity(list, userCity);
  }

  // Legacy rows: fuzzy match when category name was edited or slug drifted
  const looseKey = slug.replace(/-/g, ' ');
  const { data: loose, error: looseErr } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .ilike('category', `%${looseKey}%`)
    .order('name', { ascending: true });

  if (looseErr) throw looseErr;
  return filterServicesByCity(loose || [], userCity);
}

export { slugifyCategoryName };
