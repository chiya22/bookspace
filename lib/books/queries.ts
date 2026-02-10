import { createSupabaseServerClient } from '@/lib/supabase/server';

export type BookRow = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  cover_image_path: string | null;
};

/**
 * 蔵書を検索する（タイトル・著者・出版社・ISBN の前後部分一致）。
 * keyword が空の場合は全件取得（ページネーションは未対応）。
 * tagIds を指定した場合、それらすべてのタグが付いた書籍のみに絞り込む（AND条件）。
 */
export async function searchBooks(
  keyword: string,
  tagIds?: string[] | null
): Promise<BookRow[]> {
  const supabase = createSupabaseServerClient();
  const k = keyword.trim();
  let data: BookRow[];

  if (!k) {
    const { data: rows } = await supabase
      .from('books')
      .select('id, title, author, publisher, isbn, cover_image_path')
      .order('title');
    data = (rows ?? []) as BookRow[];
  } else {
    const pattern = `%${k}%`;
    const { data: rows } = await supabase
      .from('books')
      .select('id, title, author, publisher, isbn, cover_image_path')
      .or(`title.ilike.${pattern},author.ilike.${pattern},publisher.ilike.${pattern},isbn.ilike.${pattern}`)
      .order('title');
    data = (rows ?? []) as BookRow[];
  }

  const ids = tagIds?.filter((id) => id?.trim()) ?? [];
  if (ids.length > 0) {
    const sets = await Promise.all(
      ids.map(async (tagId) => {
        const { data: rows } = await supabase
          .from('book_tags')
          .select('book_id')
          .eq('tag_id', tagId);
        return new Set((rows ?? []).map((r) => (r as { book_id: string }).book_id));
      })
    );
    const intersection = sets.reduce((acc, set) => {
      return new Set([...acc].filter((id) => set.has(id)));
    });
    data = data.filter((b) => intersection.has(b.id));
  }

  return data;
}

export async function getBookById(id: string): Promise<BookRow | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('books')
    .select('id, title, author, publisher, isbn, cover_image_path')
    .eq('id', id)
    .single();
  return data as BookRow | null;
}

export async function getBookByIsbn(isbn: string): Promise<BookRow | null> {
  const supabase = createSupabaseServerClient();
  const trimmed = isbn.trim();
  const normalized = trimmed.replace(/-/g, '');

  // 蔵書はハイフンあり/なしのどちらでも登録されている可能性があるため両方で検索
  const { data } = await supabase
    .from('books')
    .select('id, title, author, publisher, isbn, cover_image_path')
    .eq('isbn', normalized)
    .maybeSingle();
  if (data) return data as BookRow;

  if (normalized !== trimmed) {
    const { data: data2 } = await supabase
      .from('books')
      .select('id, title, author, publisher, isbn, cover_image_path')
      .eq('isbn', trimmed)
      .maybeSingle();
    if (data2) return data2 as BookRow;
  }

  const { data: data3 } = await supabase
    .from('books')
    .select('id, title, author, publisher, isbn, cover_image_path')
    .ilike('isbn', `%${normalized}%`)
    .limit(1)
    .maybeSingle();
  return data3 ? (data3 as BookRow) : null;
}
