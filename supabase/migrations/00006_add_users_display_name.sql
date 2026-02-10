-- 表示名（ログイン中やアカウント画面で表示する名前）。未設定の場合は name にフォールバックする。
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS display_name TEXT;

UPDATE public.users
SET display_name = name
WHERE display_name IS NULL;

COMMENT ON COLUMN public.users.display_name IS '表示名。未設定時は name を表示に使用する。';
