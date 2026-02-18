-- public.users に RLS を有効化する。
-- 本アプリはサーバー側で SUPABASE_SERVICE_ROLE_KEY のみを使用しており、
-- サービスロールは RLS をバイパスするため、既存の動作は変わらない。
-- anon / authenticated にはポリシーを付けないため、クライアントから
-- これらのキーで users に直接アクセスしても行は返らない（セキュリティ向上）。
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.users IS '利用者。NextAuth Credentials で照合。Supabase Auth は使わない。RLS 有効・anon/authenticated 用ポリシーなし（サービスロールのみアクセス可）。';
