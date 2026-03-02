-- PostgREST に公開されている public テーブルに RLS を有効化する。
-- サービスロールは RLS をバイパスするため、既存のアプリ動作は変わらない。
-- anon / authenticated 用のポリシーは追加しないため、これらのキーでは
-- どの行も操作できず、アラート「RLS has not been enabled」を解消する。
-- ※ public.users は 00010 で既に RLS 有効のため対象外。

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- 棚卸用テーブル（DB に存在する場合のみ有効）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory_checks') THEN
    EXECUTE 'ALTER TABLE public.inventory_checks ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory_clear_history') THEN
    EXECUTE 'ALTER TABLE public.inventory_clear_history ENABLE ROW LEVEL SECURITY';
  END IF;
END
$$;
