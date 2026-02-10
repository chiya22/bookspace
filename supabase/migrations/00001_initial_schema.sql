-- ちよプラブックスペース 初期スキーマ
-- Supabase ダッシュボードの SQL Editor で実行するか、supabase db push で適用する。

-- updated_at 自動更新用の拡張（既にあればスキップ）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 共通: updated_at を現在時刻で更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now() AT TIME ZONE 'utc';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========== users ==========
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'librarian', 'admin')) DEFAULT 'user',
  qr_code_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE INDEX idx_users_email ON public.users (email);
CREATE INDEX idx_users_role ON public.users (role);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

COMMENT ON TABLE public.users IS '利用者。NextAuth Credentials で照合。Supabase Auth は使わない。';

-- ========== books ==========
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT NOT NULL,
  isbn TEXT NOT NULL,
  cover_image_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE INDEX idx_books_isbn ON public.books (isbn);
CREATE INDEX idx_books_title ON public.books (title);

CREATE TRIGGER set_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

COMMENT ON TABLE public.books IS '書籍（書誌）。表紙画像は Storage のパスを cover_image_path に保存。';

-- ========== loans ==========
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books (id) ON DELETE CASCADE,
  lent_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE INDEX idx_loans_user_id ON public.loans (user_id);
CREATE INDEX idx_loans_book_id ON public.loans (book_id);
CREATE INDEX idx_loans_returned_at ON public.loans (returned_at);

CREATE TRIGGER set_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

COMMENT ON TABLE public.loans IS '貸出レコード。returned_at が NULL のとき貸出中。';

-- ========== email_logs ==========
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL,
  recipient_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE INDEX idx_email_logs_sent_at ON public.email_logs (sent_at);
CREATE INDEX idx_email_logs_kind ON public.email_logs (kind);

COMMENT ON TABLE public.email_logs IS 'メール送信履歴。';
