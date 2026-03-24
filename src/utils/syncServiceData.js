import { normalizeCityPricingObject } from './cityPricingJson.js';

/**
 * Smart catalog sync: `servicesData.js` → Supabase `categories` + `services`.
 * Uses `.upsert()` with `onConflict` so existing rows update instead of raising unique violations.
 *
 * Requires UNIQUE constraint targets in Postgres (see comments below). If your DB differs,
 * adjust CATEGORY_CONFLICT_TARGET / SERVICE_CONFLICT_TARGET or add a matching unique index.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {object[]} data - `servicesData` array (category blocks with nested `services`)
 * @param {{ onProgress?: (msg: string) => void }} [options]
 * @returns {Promise<SyncResult>}
 */

/**
 * @typedef {Object} SyncResult
 * @property {number} categoriesSynced
 * @property {number} servicesSynced
 * @property {number} categoriesInserted — legacy; always 0 (upsert does not distinguish)
 * @property {number} categoriesUpdated — legacy; equals categoriesSynced
 * @property {number} servicesInserted — legacy; always 0
 * @property {number} servicesUpdated — legacy; equals servicesSynced
 * @property {string[]} errors
 */

/** Supabase upsert conflict target: categories table should have UNIQUE(slug) */
export const CATEGORY_CONFLICT_TARGET = 'slug';

/**
 * Primary: UNIQUE(name) — matches common DB constraint (avoids duplicate name violations).
 * Fallback: UNIQUE(name, category) — use after adding a composite unique index (see migration note).
 */
export const SERVICE_CONFLICT_TARGET = 'name';
export const SERVICE_CONFLICT_FALLBACK = 'name,category';

/** Collapse internal whitespace and trim ends — prevents duplicate-key mismatches */
export function normalizeLabel(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Match CategoryManager slug generation, after whitespace normalization */
export function slugifyCategoryName(name) {
  const n = normalizeLabel(name);
  return n
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '');
}

/** State-wide visibility: same as typing `all` in Service Manager */
export const SERVICE_CITIES_STATEWIDE = ['all'];

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {object[]} data
 * @param {{ onProgress?: (msg: string) => void }} [options]
 */
export async function syncServicesFromData(supabase, data, options = {}) {
  const onProgress = typeof options.onProgress === 'function' ? options.onProgress : () => {};

  /** @type {SyncResult} */
  const result = {
    categoriesSynced: 0,
    servicesSynced: 0,
    categoriesInserted: 0,
    categoriesUpdated: 0,
    servicesInserted: 0,
    servicesUpdated: 0,
    errors: [],
  };

  if (!Array.isArray(data) || data.length === 0) {
    result.errors.push('servicesData array is empty.');
    return result;
  }

  for (const block of data) {
    const catName = normalizeLabel(block.categoryName || block.name || '');
    if (!catName) {
      result.errors.push('Skipped a block with no categoryName.');
      continue;
    }

    const slugRaw = block.slug != null ? normalizeLabel(block.slug) : '';
    const slug = slugRaw || slugifyCategoryName(catName);
    const icon = block.icon != null ? String(block.icon).trim() : '🔧';

    try {
      /*
       * Categories: single upsert on slug (replaces prior select → update/insert branches).
       */
      const categoryRow = {
        name: catName,
        slug,
        icon,
        is_active: true,
      };

      const { error: catUpsertErr } = await supabase
        .from('categories')
        .upsert([categoryRow], { onConflict: CATEGORY_CONFLICT_TARGET })
        .select('id');

      if (catUpsertErr) throw catUpsertErr;
      result.categoriesSynced += 1;
      result.categoriesUpdated += 1;
      onProgress(`Category upserted: ${catName} (${slug})`);

      const services = Array.isArray(block.services) ? block.services : [];
      for (const svc of services) {
        const serviceName = normalizeLabel(svc.name || '');
        if (!serviceName) {
          result.errors.push(`Skipped service with empty name under "${catName}"`);
          continue;
        }

        const basePrice = Number(svc.basePrice ?? svc.base_price ?? svc.price ?? 0);
        if (Number.isNaN(basePrice) || basePrice < 0) {
          result.errors.push(`Invalid price for "${serviceName}" under "${catName}"`);
          continue;
        }

        const imageUrl = normalizeLabel(svc.image_url || svc.imageUrl || '');
        const note = svc.note != null ? normalizeLabel(String(svc.note)) : '';

        /* city_service_pricing: jsonb on services — see migration 20250311120000_services_city_service_pricing_jsonb.sql */
        const cityServicePricingJson = normalizeCityPricingObject(svc.cityPricing);

        /*
         * OLD payload (before per-city JSON) — kept for history:
         * const serviceRow = {
         *   name: serviceName,
         *   category: catName,
         *   base_price: basePrice,
         *   image_url: imageUrl,
         *   note,
         *   service_cities: SERVICE_CITIES_STATEWIDE,
         *   is_active: true,
         * };
         */
        const serviceRow = {
          name: serviceName,
          category: catName,
          base_price: basePrice,
          image_url: imageUrl,
          note,
          service_cities: SERVICE_CITIES_STATEWIDE,
          is_active: true,
          city_service_pricing: cityServicePricingJson,
        };

        let { error: svcErr } = await supabase
          .from('services')
          .upsert([serviceRow], { onConflict: SERVICE_CONFLICT_TARGET })
          .select('id');

        /*
         * If DB only has UNIQUE(name) (not composite), primary upsert may fail — try name-only.
         */
        let usedFallback = false;
        if (svcErr && SERVICE_CONFLICT_TARGET !== SERVICE_CONFLICT_FALLBACK) {
          const fb = await supabase
            .from('services')
            .upsert([serviceRow], { onConflict: SERVICE_CONFLICT_FALLBACK })
            .select('id');
          svcErr = fb.error;
          usedFallback = !svcErr;
        }

        if (svcErr) throw svcErr;

        result.servicesSynced += 1;
        result.servicesUpdated += 1;
        onProgress(
          usedFallback
            ? `  ↳ Service upserted (onConflict: ${SERVICE_CONFLICT_FALLBACK}): ${serviceName}`
            : `  ↳ Service upserted (onConflict: ${SERVICE_CONFLICT_TARGET}): ${serviceName}`
        );
      }
    } catch (e) {
      const msg = e?.message || String(e);
      result.errors.push(`Block "${catName}": ${msg}`);
      onProgress(`ERROR [${catName}]: ${msg}`);
    }
  }

  return result;
}
