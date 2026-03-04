-- Add user_id to customers for linking to auth (password reset from DeepakHQ)
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
