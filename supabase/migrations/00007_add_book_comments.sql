-- 書籍への利用者コメント（1書籍に複数ユーザーが複数コメント可能。編集不可）
CREATE TABLE public.book_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE INDEX idx_book_comments_book_id ON public.book_comments (book_id);
CREATE INDEX idx_book_comments_created_at ON public.book_comments (created_at);

COMMENT ON TABLE public.book_comments IS '書籍への利用者コメント。日付・利用者表示名・本文を管理。登録後の編集は不可。';
