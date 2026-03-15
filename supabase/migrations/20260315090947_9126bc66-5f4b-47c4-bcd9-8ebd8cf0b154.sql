ALTER TABLE public.training_records ADD COLUMN IF NOT EXISTS has_ss boolean DEFAULT false;
ALTER TABLE public.training_records ADD COLUMN IF NOT EXISTS has_cb boolean DEFAULT false;