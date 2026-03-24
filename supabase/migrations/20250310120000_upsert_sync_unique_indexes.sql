-- Supports syncServiceData.js upsert: onConflict 'slug' (categories).
-- Apply if sync errors: "there is no unique or exclusion constraint matching the ON CONFLICT specification".

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique ON public.categories (slug);

-- Optional (only if you need the same display name under two categories AND no global UNIQUE on services.name):
-- CREATE UNIQUE INDEX IF NOT EXISTS services_name_category_unique ON public.services (name, category);
