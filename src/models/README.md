# `src/models`

Canonical **field maps** and **row mappers** for Supabase tables. This project does **not** use Prisma/Mongoose/Sequelize in the frontend bundle; the database is **PostgreSQL** on Supabase.

| Module | Table | Purpose |
|--------|--------|---------|
| `City.js` | `cities` | Canonical cities (name, state, active) |
| `Service.js` | `services` | Existing services; `base_price` = static fallback |
| `CityServicePricing.js` | `city_service_pricing` | Per-city dynamic price per service |

DDL: see `supabase/migrations/20250308100000_dynamic_pricing_schema.sql`.

Seed data: `npm run seed:pricing` (requires `SUPABASE_SERVICE_ROLE_KEY` in env).
