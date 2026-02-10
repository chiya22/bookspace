import { createSupabaseServerClient } from '@/lib/supabase/server';

export type LoanWithBook = {
  id: string;
  lent_at: string;
  returned_at: string | null;
  books: { id: string; title: string; author: string; isbn: string } | null;
};

export type LoanWithBookAndUser = LoanWithBook & {
  users: { id: string; name: string; email: string } | null;
};

/**
 * 指定利用者の貸出・返却履歴を取得（貸出日降順）。
 */
export async function getLoansByUserId(userId: string): Promise<LoanWithBook[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('loans')
    .select(
      `
      id,
      lent_at,
      returned_at,
      books ( id, title, author, isbn )
    `
    )
    .eq('user_id', userId)
    .order('lent_at', { ascending: false });
  return (data ?? []) as LoanWithBook[];
}

export type LoanHistoryFilter = 'all' | 'active' | 'returned';

/**
 * 全貸出履歴を取得（司書・管理者用）。貸出日降順。
 */
export async function getAllLoans(
  filter: LoanHistoryFilter = 'all'
): Promise<LoanWithBookAndUser[]> {
  const supabase = createSupabaseServerClient();
  let q = supabase
    .from('loans')
    .select(
      `
      id,
      lent_at,
      returned_at,
      user_id,
      book_id,
      books ( id, title, author, isbn ),
      users ( id, name, email )
    `
    )
    .order('lent_at', { ascending: false });

  if (filter === 'active') {
    q = q.is('returned_at', null);
  } else if (filter === 'returned') {
    q = q.not('returned_at', 'is', null);
  }

  const { data } = await q;
  return (data ?? []) as LoanWithBookAndUser[];
}

/**
 * 貸出履歴一覧をキーワードで絞り込む（利用者名・メール・書籍タイトル・著者）。
 */
export function filterLoansByKeyword(
  loans: LoanWithBookAndUser[],
  keyword: string
): LoanWithBookAndUser[] {
  const k = keyword.trim().toLowerCase();
  if (!k) return loans;
  return loans.filter((loan) => {
    const user = loan.users;
    const book = loan.books;
    const name = (user?.name ?? '').toLowerCase();
    const email = (user?.email ?? '').toLowerCase();
    const title = (book?.title ?? '').toLowerCase();
    const author = (book?.author ?? '').toLowerCase();
    return name.includes(k) || email.includes(k) || title.includes(k) || author.includes(k);
  });
}
