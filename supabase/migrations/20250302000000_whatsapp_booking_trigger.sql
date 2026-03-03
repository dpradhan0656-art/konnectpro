-- =============================================================================
-- WhatsApp Alert on New Booking (Supabase + Meta Cloud API)
-- Run this in Supabase SQL Editor. Ensure "pg_net" extension is enabled.
-- =============================================================================

-- 1. Clean up existing objects (idempotent)
DROP TRIGGER IF EXISTS trigger_whatsapp_on_new_booking ON public.bookings;
DROP FUNCTION IF EXISTS public.send_whatsapp_on_new_booking();

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION public.send_whatsapp_on_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  api_url     text := 'https://graph.facebook.com/v21.0/997778973421649/messages';
  bearer_token text := 'EAAZAz4RZBgjWcBQ4qLfDG5eQZAQeMjDkrKz5jeMQ6ROto6FqjwZBm0IZBndTsN5Qj9sOUlEAaZC19akgwc6Gv5vOthRLKcfgEc7slBIaENOyYZARwYLykKH5VXXNRRZB5xYEhr2ZBfVk616jn0xvL1sKcipvHINVHS3zcXvDTm2ghjBlDGF1Nvi7FnLxVg9ohLgBb73Gp4WZAZCrZCDDJp01q3ZB0Y0xp5peGPoZBOpFtlRISW7TjnvZBgGGzyko6uF1fv4oiQEwbvZCwTfBAcdCWFenAe0bBwZDZD';
  to_phone    text := '919589634799';
  req_body    jsonb;
  req_headers jsonb;
  customer_name text;
BEGIN
  -- Optional: get customer name for template parameters (use column if it exists)
  -- If your table has customer_name: customer_name := COALESCE(NEW.customer_name, 'Customer');
  -- If you use contact_name (remote booking): customer_name := COALESCE(NEW.contact_name, 'Customer');
  customer_name := COALESCE(
    NULLIF(TRIM(NEW.contact_name), ''),
    NULLIF(TRIM(NEW.customer_name), ''),
    'Customer'
  );

  -- Build WhatsApp template message body.
  -- For no parameters (template has no placeholders):
  req_body := jsonb_build_object(
    'messaging_product', 'whatsapp',
    'to', to_phone,
    'type', 'template',
    'template', jsonb_build_object(
      'name', 'new_order_alert',
      'language', jsonb_build_object('code', 'en')
      -- Optional: add template parameters (e.g. body with customer name)
      -- 'components', jsonb_build_array(
      --   jsonb_build_object(
      --     'type', 'body',
      --     'parameters', jsonb_build_array(
      --       jsonb_build_object('type', 'text', 'text', customer_name),
      --       jsonb_build_object('type', 'text', 'text', NEW.service_name),
      --       jsonb_build_object('type', 'text', 'text', NEW.total_amount::text)
      --     )
      --   )
      -- )
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

-- 3. Attach trigger: run after each new row is inserted
CREATE TRIGGER trigger_whatsapp_on_new_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.send_whatsapp_on_new_booking();

-- =============================================================================
-- NOTES
-- =============================================================================
-- 1. Enable pg_net (if not already): In Dashboard > Database > Extensions, enable "pg_net".
-- 2. Store the Bearer token securely: use Supabase Vault or Database Secrets and
--    reference it (e.g. current_setting('app.settings.whatsapp_token')) instead
--    of hardcoding above.
-- 3. Template parameters: If "new_order_alert" has placeholders (e.g. {{1}} = name,
--    {{2}} = service), uncomment the 'components' block and match the order to
--    your template. Add more parameters as needed (date, amount, address, etc.).
-- 4. Column names: We use contact_name and customer_name; adjust to match your
--    bookings table columns.
-- =============================================================================
