-- 利用者ごとのお気に入り書籍（蔵書検索で星マーク登録）
CREATE TABLE public.user_favorites (
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  PRIMARY KEY (user_id, book_id)
);

CREATE INDEX idx_user_favorites_user_id ON public.user_favorites (user_id);
CREATE INDEX idx_user_favorites_book_id ON public.user_favorites (book_id);

COMMENT ON TABLE public.user_favorites IS '利用者がお気に入り登録した書籍。';
