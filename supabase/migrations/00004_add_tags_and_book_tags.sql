-- タグマスタ（1書籍に複数タグを付与可能）
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE INDEX idx_tags_name ON public.tags (name);

COMMENT ON TABLE public.tags IS '書籍タグのマスタ。';

-- 書籍とタグの中間テーブル（多対多）
CREATE TABLE public.book_tags (
  book_id UUID NOT NULL REFERENCES public.books (id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags (id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, tag_id)
);

CREATE INDEX idx_book_tags_book_id ON public.book_tags (book_id);
CREATE INDEX idx_book_tags_tag_id ON public.book_tags (tag_id);

COMMENT ON TABLE public.book_tags IS '書籍に付与されたタグ。';
