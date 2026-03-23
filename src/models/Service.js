/**
 * Service model — existing table `public.services` (Supabase).
 *
 * IMPORTANT (non-breaking):
 * - DB columns remain `name`, `base_price`, etc. Do not remove `base_price`; it is the
 *   fallback when dynamic pricing is disabled or missing.
 * - Optional `description` may be added by migration; legacy `note` is still used in UI.
 *
 * Naming map (docs / API style → DB column):
 * - serviceName → name
 * - basePrice → base_price
 * - description → description (optional) or note (legacy copy)
 *
 * @module models/Service
 */

export const SERVICE_TABLE = 'services';

export const ServiceFields = {
  id: 'id',
  name: 'name',
  category: 'category',
  basePrice: 'base_price',
  description: 'description',
  note: 'note',
  imageUrl: 'image_url',
  serviceCities: 'service_cities',
  isActive: 'is_active',
};

/**
 * @typedef {Object} ServiceRow
 * @property {string} id
 * @property {string} name - "serviceName" in product docs
 * @property {string} category
 * @property {number} base_price - static fallback (basePrice)
 * @property {string} [description] - optional long text
 * @property {string} [note] - legacy short note
 * @property {string} [image_url]
 * @property {string[]|null} [service_cities]
 * @property {boolean} [is_active]
 */

/**
 * @param {ServiceRow} row
 * @returns {{
 *   id: string,
 *   serviceName: string,
 *   category: string,
 *   basePrice: number,
 *   description: string | null,
 *   note: string | null,
 *   imageUrl: string | null,
 *   serviceCities: string[]|null,
 *   isActive: boolean
 * }}
 */
export function mapServiceRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    serviceName: row.name,
    category: row.category,
    basePrice: Number(row.base_price ?? row.price ?? 0),
    description: row.description ?? null,
    note: row.note ?? null,
    imageUrl: row.image_url ?? null,
    serviceCities: row.service_cities ?? null,
    isActive: Boolean(row.is_active),
  };
}
