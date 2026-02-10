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
