import { createSupabaseServerClient } from '@/lib/supabase/server';

export type BookInventoryRow = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  status: 'available' | 'loaned';
  borrowedBy?: string;
};

/**
 * 棚卸用: 全蔵書と貸出状態を取得。
 */
export async function getBooksWithLoanStatus(): Promise<BookInventoryRow[]> {
  const supabase = createSupabaseServerClient();
  const { data: books } = await supabase
    .from('books')
    .select('id, title, author, isbn')
    .order('title');
  const { data: activeLoans } = await supabase
    .from('loans')
    .select('book_id, users ( name )')
    .is('returned_at', null);

  const loanByBookId = new Map<string, string>();
  for (const row of activeLoans ?? []) {
    const r = row as { book_id: string; users?: { name: string } | null; user?: { name: string } | null };
    const name = r.users?.name ?? r.user?.name;
    if (name) loanByBookId.set(r.book_id, name);
  }

  return (books ?? []).map((b) => {
    const book = b as { id: string; title: string; author: string; isbn: string };
    const borrowedBy = loanByBookId.get(book.id);
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      status: borrowedBy ? ('loaned' as const) : ('available' as const),
      borrowedBy,
    };
  });
}

/**
 * 在庫チェック済みの book_id 一覧を取得。
 */
export async function getCheckedBookIds(): Promise<Set<string>> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('inventory_checks').select('book_id');
  const set = new Set<string>();
  for (const row of data ?? []) {
    set.add((row as { book_id: string }).book_id);
  }
  return set;
}

/**
 * 在庫チェック履歴を最後にクリアした日時（1件のみ、直近）。
 */
export async function getLastInventoryClearedAt(): Promise<Date | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('inventory_clear_history')
    .select('cleared_at')
    .order('cleared_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const row = data as { cleared_at: string } | null;
  return row?.cleared_at ? new Date(row.cleared_at) : null;
}

/**
 * 在庫チェック履歴が存在しない書籍（未チェック）の一覧を取得。
 */
export async function getBooksNotChecked(): Promise<BookInventoryRow[]> {
  const [allBooks, checkedIds] = await Promise.all([
    getBooksWithLoanStatus(),
    getCheckedBookIds(),
  ]);
  return allBooks.filter((b) => !checkedIds.has(b.id));
}
