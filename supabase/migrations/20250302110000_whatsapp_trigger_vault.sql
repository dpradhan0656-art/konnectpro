-- =============================================================================
-- WhatsApp Alert on New Booking — Token from Vault (no hardcoding)
-- Requires: pg_net extension, Vault secret named 'whatsapp_bearer_token'
-- =============================================================================

DROP TRIGGER IF EXISTS trigger_whatsapp_on_new_booking ON public.bookings;
DROP FUNCTION IF EXISTS public.send_whatsapp_on_new_booking();

CREATE OR REPLACE FUNCTION public.send_whatsapp_on_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  api_url      text := 'https://graph.facebook.com/v21.0/997778973421649/messages';
  bearer_token text;
  to_phone     text := '919589634799';
  req_body     jsonb;
  req_headers  jsonb;
  customer_name text;
BEGIN
  -- Read token from Vault; if missing, skip WhatsApp call (no leak)
  SELECT decrypted_secret INTO bearer_token
  FROM vault.decrypted_secrets
  WHERE name = 'whatsapp_bearer_token'
  LIMIT 1;

  IF bearer_token IS NULL OR bearer_token = '' THEN
    RETURN NEW;
  END IF;

  customer_name := COALESCE(
    NULLIF(TRIM(NEW.contact_name), ''),
    NULLIF(TRIM(NEW.customer_name), ''),
    'Customer'
  );

  req_body := jsonb_build_object(
    'messaging_product', 'whatsapp',
    'to', to_phone,
    'type', 'template',
    'template', jsonb_build_object(
      'name', 'new_order_alert',
      'language', jsonb_build_object('code', 'en')
    )
  );

  req_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || bearer_token
  );

  PERFORM net.http_post(
    url := api_url,
    body := req_body,
    headers := req_headers
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_whatsapp_on_new_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.send_whatsapp_on_new_booking();

-- =============================================================================
-- After deploy: In Supabase Dashboard → Vault, add secret:
--   Name: whatsapp_bearer_token
--   Value: <your Meta WhatsApp API token>
-- =============================================================================
