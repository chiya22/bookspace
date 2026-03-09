import { createSupabaseServerClient } from '@/lib/supabase/server';

export type LoanWithBook = {
  id: string;
  lent_at: string;
  returned_at: string | null;
  books: { id: string; title: string; author: string; isbn: string; cover_image_path: string | null } | null;
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
      books ( id, title, author, isbn, cover_image_path )
    `
    )
    .eq('user_id', userId)
    .order('lent_at', { ascending: false });
  return (data ?? []) as LoanWithBook[];
}

/**
 * 指定利用者の貸出・返却履歴をページングで取得（貸出日降順）。
 */
export async function getLoansByUserIdPaginated(
  userId: string,
  page: number,
  pageSize: number
): Promise<{ loans: LoanWithBook[]; totalCount: number }> {
  const supabase = createSupabaseServerClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase
    .from('loans')
    .select(
      `
      id,
      lent_at,
      returned_at,
      books ( id, title, author, isbn, cover_image_path )
    `,
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .order('lent_at', { ascending: false })
    .range(from, to);
  return {
    loans: (data ?? []) as LoanWithBook[],
    totalCount: count ?? 0,
  };
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
      books ( id, title, author, isbn, cover_image_path ),
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
/**
 * 指定された書籍IDのうち、現在貸出中のものを返す。
 * 蔵書検索・一覧で貸出状態を表示するために使用。
 */
export async function getOnLoanBookIds(bookIds: string[]): Promise<Set<string>> {
  if (bookIds.length === 0) return new Set();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('loans')
    .select('book_id')
    .in('book_id', bookIds)
    .is('returned_at', null);
  const ids = (data ?? []).map((r) => (r as { book_id: string }).book_id);
  return new Set(ids);
}

/**
 * 指定された貸出IDについて、返却依頼メールの送信日時を取得する。
 * 複数回送信されている場合は最新の sent_at を返す。
 */
export async function getReturnRequestSentAtByLoanIds(
  loanIds: string[]
): Promise<Map<string, string>> {
  if (loanIds.length === 0) return new Map();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('email_logs')
    .select('loan_id, sent_at')
    .eq('kind', 'return_request')
    .in('loan_id', loanIds)
    .order('sent_at', { ascending: false });

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    const r = row as { loan_id: string | null; sent_at: string };
    if (r.loan_id && !map.has(r.loan_id)) {
      map.set(r.loan_id, r.sent_at);
    }
  }
  return map;
}

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
