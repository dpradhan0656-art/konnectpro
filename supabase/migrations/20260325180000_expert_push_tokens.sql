-- Expert mobile push (Expo Push Token) + UI language for localized notification copy
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS expo_push_token text,
  ADD COLUMN IF NOT EXISTS expo_push_token_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS expo_ui_lang text DEFAULT 'en';

COMMENT ON COLUMN public.experts.expo_push_token IS 'Expo Push token for assignment alerts (Android/iOS via Expo Push service)';
COMMENT ON COLUMN public.experts.expo_ui_lang IS 'Last selected app language code (e.g. hi, en) for push copy';
