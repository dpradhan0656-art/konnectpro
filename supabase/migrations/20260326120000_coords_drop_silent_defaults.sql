-- Prevent silent city-centroid (or any) defaults on GPS columns — coordinates should be
-- NULL until a real device/browser fix, or an explicit admin geocode flow adds them.
-- Safe to apply even if no DEFAULT was set (no-op).

ALTER TABLE public.experts
  ALTER COLUMN latitude DROP DEFAULT,
  ALTER COLUMN longitude DROP DEFAULT;

ALTER TABLE public.bookings
  ALTER COLUMN latitude DROP DEFAULT,
  ALTER COLUMN longitude DROP DEFAULT;
