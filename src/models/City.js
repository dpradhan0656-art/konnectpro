/**
 * City model — PostgreSQL table `public.cities` (Supabase).
 * ORM: project uses Supabase JS; this file is the canonical field map + helpers.
 *
 * @module models/City
 */

/** Supabase table name */
export const CITY_TABLE = 'cities';

/** Column names (snake_case = DB) */
export const CityFields = {
  id: 'id',
  name: 'name',
  state: 'state',
  isActive: 'is_active',
  createdAt: 'created_at',
};

/**
 * @typedef {Object} CityRow
 * @property {string} id - uuid
 * @property {string} name - unique city label (e.g. "Jabalpur")
 * @property {string} state
 * @property {boolean} is_active
 * @property {string} [created_at] - ISO timestamp
 */

/**
 * Map a DB row to a stable app shape (camelCase).
 * @param {CityRow} row
 * @returns {{ id: string, name: string, state: string, isActive: boolean, createdAt?: string }}
 */
export function mapCityRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    state: row.state ?? '',
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}
