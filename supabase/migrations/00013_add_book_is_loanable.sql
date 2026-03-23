-- 追加: 蔵書の「貸出対象外」ステータス
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_loanable BOOLEAN NOT NULL DEFAULT true;

-- 既存のデータをすべて貸出可能とする
UPDATE public.books SET is_loanable = true WHERE is_loanable IS NULL;
