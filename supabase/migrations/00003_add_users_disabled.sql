ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS disabled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.users.disabled IS 'true の場合はログイン不可（無効化）';
