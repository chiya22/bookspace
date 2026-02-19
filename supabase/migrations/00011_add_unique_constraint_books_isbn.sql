-- ISBN が同一の書籍を登録できないようにする
ALTER TABLE public.books
  ADD CONSTRAINT books_isbn_key UNIQUE (isbn);
