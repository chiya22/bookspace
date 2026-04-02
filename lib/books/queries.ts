import { createSupabaseServerClient } from '@/lib/supabase/server';

export type BookRow = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  cover_image_path: string | null;
  is_loanable: boolean;
};

/**
 * 蔵書を検索する（タイトル・著者・出版社・ISBN の前後部分一致）。
 * DB レベルでページネーション・タグ絞り込みを行い、結果と総件数を返す。
 * restrictToBookIds を指定した場合、そのIDリストに含まれる書籍のみに絞り込む（お気に入りフィルタ等）。
 */
export async function searchBooks(
  keyword: string,
  tagIds: string[] | null,
  page: number,
  pageSize: number,
  restrictToBookIds?: string[] | null
): Promise<{ books: BookRow[]; totalCount: number }> {
  const supabase = createSupabaseServerClient();
  const k = keyword.trim();

  // タグ絞り込み: 1クエリで全タグ分取得し、AND条件で絞り込む
  const tagIdList = tagIds?.filter((id) => id?.trim()) ?? [];
  let tagFilteredBookIds: string[] | null = null;
  if (tagIdList.length > 0) {
    const { data: rows } = await supabase
      .from('book_tags')
      .select('book_id, tag_id')
      .in('tag_id', tagIdList);
    const bookTagCounts = new Map<string, number>();
    for (const row of rows ?? []) {
      const r = row as { book_id: string; tag_id: string };
      bookTagCounts.set(r.book_id, (bookTagCounts.get(r.book_id) ?? 0) + 1);
    }
    tagFilteredBookIds = [...bookTagCounts.entries()]
      .filter(([, count]) => count === tagIdList.length)
      .map(([bookId]) => bookId);
    if (tagFilteredBookIds.length === 0) {
      return { books: [], totalCount: 0 };
    }
  }

  // restrictToBookIds とタグ絞り込みの両方がある場合は交差を取る
  let finalBookIdFilter: string[] | null = null;
  if (tagFilteredBookIds && restrictToBookIds) {
    const restrictSet = new Set(restrictToBookIds);
    finalBookIdFilter = tagFilteredBookIds.filter((id) => restrictSet.has(id));
    if (finalBookIdFilter.length === 0) {
      return { books: [], totalCount: 0 };
    }
  } else if (tagFilteredBookIds) {
    finalBookIdFilter = tagFilteredBookIds;
  } else if (restrictToBookIds) {
    finalBookIdFilter = restrictToBookIds;
    if (finalBookIdFilter.length === 0) {
      return { books: [], totalCount: 0 };
    }
  }

  let query = supabase
    .from('books')
    .select('id, title, author, publisher, isbn, cover_image_path, is_loanable', { count: 'exact' });

  if (k) {
    const pattern = `%${k}%`;
    query = query.or(
      `title.ilike.${pattern},author.ilike.${pattern},publisher.ilike.${pattern},isbn.ilike.${pattern}`
    );
  }

  if (finalBookIdFilter) {
    query = query.in('id', finalBookIdFilter);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  return {
    books: (data ?? []) as BookRow[],
    totalCount: count ?? 0,
  };
}

export async function getBookById(id: string): Promise<BookRow | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('books')
    .select('id, title, author, publisher, isbn, cover_image_path, is_loanable')
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
    .select('id, title, author, publisher, isbn, cover_image_path, is_loanable')
    .eq('isbn', normalized)
    .maybeSingle();
  if (data) return data as BookRow;

  if (normalized !== trimmed) {
    const { data: data2 } = await supabase
      .from('books')
      .select('id, title, author, publisher, isbn, cover_image_path, is_loanable')
      .eq('isbn', trimmed)
      .maybeSingle();
    if (data2) return data2 as BookRow;
  }

  const { data: data3 } = await supabase
    .from('books')
    .select('id, title, author, publisher, isbn, cover_image_path, is_loanable')
    .ilike('isbn', `%${normalized}%`)
    .limit(1)
    .maybeSingle();
  return data3 ? (data3 as BookRow) : null;
}
