import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * 指定ユーザーがお気に入り登録している書籍ID一覧を取得する。
 */
export async function getFavoriteBookIds(userId: string): Promise<Set<string>> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('user_favorites')
    .select('book_id')
    .eq('user_id', userId);
  const ids = (data ?? []).map((r) => (r as { book_id: string }).book_id);
  return new Set(ids);
}

/**
 * 指定ユーザーが指定書籍をお気に入り登録しているかどうか。
 */
export async function isBookFavorited(userId: string, bookId: string): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('user_favorites')
    .select('book_id')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .maybeSingle();
  return data != null;
}
