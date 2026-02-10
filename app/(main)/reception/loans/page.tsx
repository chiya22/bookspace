import { Suspense } from 'react';
import { getSession } from '@/lib/auth';
import { getAllLoans, filterLoansByKeyword, type LoanHistoryFilter } from '@/lib/loans/queries';
import Link from 'next/link';
import { LoanHistorySearchForm } from '@/components/reception/LoanHistorySearchForm';

export const metadata = {
  title: '貸出履歴一覧 | ちよプラブックスペース',
  description: '全利用者の貸出・返却履歴',
};

type PageProps = { searchParams: Promise<{ filter?: string; q?: string }> };

const FILTER_OPTIONS: { value: LoanHistoryFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'active', label: '貸出中' },
  { value: 'returned', label: '返却済み' },
];

function loanDays(lentAt: string, returnedAt: string | null): number {
  const end = returnedAt ? new Date(returnedAt).getTime() : Date.now();
  return Math.floor((end - new Date(lentAt).getTime()) / (24 * 60 * 60 * 1000));
}

export default async function ReceptionLoansPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return null;
  }

  const resolved = await searchParams;
  const filterParam = resolved.filter;
  const filter: LoanHistoryFilter =
    filterParam === 'active' || filterParam === 'returned' ? filterParam : 'all';
  const keyword = typeof resolved.q === 'string' ? resolved.q : '';

  const allLoans = await getAllLoans(filter);
  const loans = filterLoansByKeyword(allLoans, keyword);

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">貸出履歴一覧</h1>
      <p className="mt-2 text-sm text-zinc-600">
        全利用者の貸出・返却履歴です。状態で絞り込み、キーワードで検索できます。
      </p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={
              opt.value === 'all'
                ? (keyword ? `/reception/loans?q=${encodeURIComponent(keyword)}` : '/reception/loans')
                : `/reception/loans?filter=${opt.value}${keyword ? `&q=${encodeURIComponent(keyword)}` : ''}`
            }
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              filter === opt.value
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {opt.label}
          </Link>
        ))}
        </div>
        <Suspense fallback={<div className="h-10 flex-1 rounded border border-zinc-200 bg-zinc-50" />}>
          <LoanHistorySearchForm
            defaultValue={keyword}
            currentFilter={filter}
          />
        </Suspense>
      </div>

      <div className="mt-6 overflow-x-auto">
        {loans.length > 0 ? (
          <table className="w-full min-w-[600px] border-collapse rounded-lg border border-zinc-200 bg-white text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-2 text-left font-medium text-zinc-700">利用者</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-700">書籍</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-700">貸出日</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-700">返却日</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-700">貸出日数</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-700">状態</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => {
                const book = loan.books;
                const user = loan.users;
                const lentAtStr = loan.lent_at
                  ? new Date(loan.lent_at).toLocaleDateString('ja-JP')
                  : '—';
                const returnedAtStr = loan.returned_at
                  ? new Date(loan.returned_at).toLocaleDateString('ja-JP')
                  : '—';
                const days = loanDays(loan.lent_at, loan.returned_at);
                const isActive = !loan.returned_at;
                return (
                  <tr key={loan.id} className="border-b border-zinc-100">
                    <td className="px-4 py-2 text-zinc-900">
                      {user?.name ?? '—'}
                      <span className="block text-xs text-zinc-500">{user?.email ?? ''}</span>
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/books/${book?.id ?? '#'}`}
                        className="text-zinc-900 hover:underline"
                      >
                        {book?.title ?? '—'}
                      </Link>
                      <span className="block text-zinc-500">{book?.author ?? '—'}</span>
                    </td>
                    <td className="px-4 py-2 text-zinc-600">{lentAtStr}</td>
                    <td className="px-4 py-2 text-zinc-600">{returnedAtStr}</td>
                    <td className="px-4 py-2 text-zinc-600">{days}日</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                          isActive ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {isActive ? '貸出中' : '返却済み'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
            該当する履歴はありません。
          </p>
        )}
      </div>
    </div>
  );
}
