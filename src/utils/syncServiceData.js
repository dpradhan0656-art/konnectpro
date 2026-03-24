/**
 * Smart catalog sync: `servicesData.js` → Supabase `categories` + `services`.
 * Idempotent: categories matched by `slug` then exact `name`; services by (`name` + `category`).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {object[]} data - `servicesData` array (category blocks with nested `services`)
 * @param {{ onProgress?: (msg: string) => void }} [options]
 * @returns {Promise<SyncResult>}
 */

/**
 * @typedef {Object} SyncResult
 * @property {number} categoriesInserted
 * @property {number} categoriesUpdated
 * @property {number} servicesInserted
 * @property {number} servicesUpdated
 * @property {string[]} errors
 */

/** Match CategoryManager slug generation */
export function slugifyCategoryName(name) {
  return String(name || '')
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
    const catName = (block.categoryName || block.name || '').trim();
    if (!catName) {
      result.errors.push('Skipped a block with no categoryName.');
      continue;
    }

    const slug = (block.slug && String(block.slug).trim()) || slugifyCategoryName(catName);
    const icon = block.icon != null ? String(block.icon) : '🔧';

    try {
      let categoryId = null;

      const { data: bySlug, error: errSlug } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', slug)
        .maybeSingle();

      if (errSlug) throw errSlug;

      if (bySlug?.id) {
        const { error: upErr } = await supabase
          .from('categories')
          .update({
            name: catName,
            icon,
            slug,
            is_active: true,
          })
          .eq('id', bySlug.id);
        if (upErr) throw upErr;
        categoryId = bySlug.id;
        result.categoriesUpdated += 1;
        onProgress(`Category updated (slug): ${catName}`);
      } else {
        const { data: byName, error: errName } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('name', catName)
          .maybeSingle();

        if (errName) throw errName;

        if (byName?.id) {
          const { error: upErr } = await supabase
            .from('categories')
            .update({
              name: catName,
              icon,
              slug,
              is_active: true,
            })
            .eq('id', byName.id);
          if (upErr) throw upErr;
          categoryId = byName.id;
          result.categoriesUpdated += 1;
          onProgress(`Category updated (name): ${catName}`);
        } else {
          const { data: inserted, error: insErr } = await supabase
            .from('categories')
            .insert([
              {
                name: catName,
                slug,
                icon,
                is_active: true,
              },
            ])
            .select('id')
            .single();
          if (insErr) throw insErr;
          categoryId = inserted?.id;
          result.categoriesInserted += 1;
          onProgress(`Category inserted: ${catName}`);
        }
      }

      if (!categoryId) {
        result.errors.push(`Could not resolve category id for: ${catName}`);
        continue;
      }

      const services = Array.isArray(block.services) ? block.services : [];
      for (const svc of services) {
        const serviceName = (svc.name || '').trim();
        if (!serviceName) {
          result.errors.push(`Skipped service with empty name under "${catName}"`);
          continue;
        }

        const basePrice = Number(svc.basePrice ?? svc.base_price ?? svc.price ?? 0);
        if (Number.isNaN(basePrice) || basePrice < 0) {
          result.errors.push(`Invalid price for "${serviceName}" under "${catName}"`);
          continue;
        }

        const imageUrl = svc.image_url || svc.imageUrl || '';
        const note = svc.note != null ? String(svc.note) : '';

        const payload = {
          name: serviceName,
          category: catName,
          base_price: basePrice,
          image_url: imageUrl,
          note,
          service_cities: SERVICE_CITIES_STATEWIDE,
          is_active: true,
        };

        const { data: existing, error: exErr } = await supabase
          .from('services')
          .select('id')
          .eq('name', serviceName)
          .eq('category', catName)
          .maybeSingle();

        if (exErr) throw exErr;

        if (existing?.id) {
          const { error: sUp } = await supabase.from('services').update(payload).eq('id', existing.id);
          if (sUp) throw sUp;
          result.servicesUpdated += 1;
          onProgress(`  ↳ Service updated: ${serviceName}`);
        } else {
          const { error: sIn } = await supabase.from('services').insert([payload]);
          if (sIn) throw sIn;
          result.servicesInserted += 1;
          onProgress(`  ↳ Service inserted: ${serviceName}`);
        }
      }
    } catch (e) {
      const msg = e?.message || String(e);
      result.errors.push(`Block "${catName}": ${msg}`);
      onProgress(`ERROR [${catName}]: ${msg}`);
    }
  }

  return result;
}
