-- ========== pending_registrations ==========
-- メール認証待ちの新規登録情報。確認メールのリンククリックで本登録（users）へ移行する
CREATE TABLE public.pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  password_hash TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE UNIQUE INDEX idx_pending_registrations_token_hash ON public.pending_registrations (token_hash);
CREATE INDEX idx_pending_registrations_email ON public.pending_registrations (email);
CREATE INDEX idx_pending_registrations_expires_at ON public.pending_registrations (expires_at);

COMMENT ON TABLE public.pending_registrations IS 'メール認証待ちの会員登録。token_hash で照合し、有効期限内なら users へ登録する。';
