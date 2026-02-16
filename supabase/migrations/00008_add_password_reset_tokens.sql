-- ========== password_reset_tokens ==========
CREATE TABLE public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE UNIQUE INDEX idx_password_reset_tokens_token_hash ON public.password_reset_tokens (token_hash);
CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens (expires_at);

COMMENT ON TABLE public.password_reset_tokens IS 'パスワードリセット用トークン。token_hash はハッシュ化したトークンを保存。';
