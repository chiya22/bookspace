import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * 指定した書籍IDごとのコメント数を返す。
 */
export async function getCommentCountsByBookIds(bookIds: string[]): Promise<Map<string, number>> {
  if (bookIds.length === 0) return new Map();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('book_comments')
    .select('book_id')
    .in('book_id', bookIds);
  const rows = (data ?? []) as { book_id: string }[];
  const map = new Map<string, number>();
  for (const id of bookIds) map.set(id, 0);
  for (const r of rows) map.set(r.book_id, (map.get(r.book_id) ?? 0) + 1);
  return map;
}

export type BookCommentRow = {
  id: string;
  book_id: string;
  user_id: string;
  body: string;
  created_at: string;
  commenter_display_name: string;
};

export async function getCommentsByBookId(bookId: string): Promise<BookCommentRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('book_comments')
    .select(
      `
      id,
      book_id,
      user_id,
      body,
      created_at,
      users ( display_name, name )
    `
    )
    .eq('book_id', bookId)
    .order('created_at', { ascending: true });

  if (error) return [];

  type Row = {
    id: string;
    book_id: string;
    user_id: string;
    body: string;
    created_at: string;
    users: { display_name: string | null; name: string } | null;
  };
  const rows = (data ?? []) as Row[];
  return rows.map((r) => ({
    id: r.id,
    book_id: r.book_id,
    user_id: r.user_id,
    body: r.body,
    created_at: r.created_at,
    commenter_display_name: r.users?.display_name ?? r.users?.name ?? '—',
  }));
}
