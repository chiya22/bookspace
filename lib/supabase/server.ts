import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// サーバー側ではサービスロールキーを利用して、RLS をバイパスする
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * サーバー側で使う Supabase クライアント（Server Component / Server Action / Route Handler 用）。
 * 環境変数が未設定の場合はビルド・実行時にエラーになる。
 *
 * ※サービスロールキーは絶対にクライアントバンドルに含めないこと！
 *  このモジュールはサーバー側からのみ import する前提です。
 */
export function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}
