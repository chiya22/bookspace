-- 既存の books.isbn をハイフンなしに統一（貸出・返却時のISBN照合を確実にするため）
UPDATE public.books
SET isbn = REPLACE(isbn, '-', '')
WHERE isbn LIKE '%-%';
