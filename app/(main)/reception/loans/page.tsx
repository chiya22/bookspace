import { Suspense } from 'react';
import { getSession } from '@/lib/auth';
import { getAllLoans, filterLoansByKeyword, type LoanHistoryFilter } from '@/lib/loans/queries';
import { getPageSize, parsePage, sliceForPage } from '@/lib/pagination';
import { PaginationNav } from '@/components/PaginationNav';
import Link from 'next/link';
import { LoanHistorySearchForm } from '@/components/reception/LoanHistorySearchForm';
import { ReturnRequestByLoanButton } from '@/components/reception/ReturnRequestByLoanButton';
import { getCoverSignedUrl, getNdlThumbnailUrl } from '@/lib/books/cover';
import { CoverImage } from '@/components/books/CoverImage';

export const metadata = {
  title: '貸出履歴一覧 | ちよプラブックスペース',
  description: '全利用者の貸出・返却履歴',
};

type PageProps = { searchParams: Promise<{ filter?: string; q?: string; page?: string }> };

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
  const pageSize = getPageSize();
  const page = parsePage(resolved);

  const allLoans = await getAllLoans(filter);
  const loansFiltered = filterLoansByKeyword(allLoans, keyword);
  const totalCount = loansFiltered.length;
  const pagedLoans = sliceForPage(loansFiltered, page, pageSize);

  const loansWithCovers = await Promise.all(
    pagedLoans.map(async (loan) => {
      const book = loan.books;
      if (!book) return { ...loan, coverUrl: null as string | null };
      const uploaded = await getCoverSignedUrl(book.cover_image_path);
      const coverUrl = uploaded ?? (getNdlThumbnailUrl(book.isbn) || null);
      return { ...loan, coverUrl };
    })
  );

  return (
    <div>
      <p className="text-sm text-zinc-600">
        全利用者の貸出・返却履歴です。状態で絞り込み、キーワードで検索できます。
      </p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div
          className="inline-flex rounded-xl p-1"
          role="group"
          aria-label="状態で絞り込み"
        >
          {FILTER_OPTIONS.map((opt) => {
            const isSelected = filter === opt.value;
            const href =
              opt.value === 'all'
                ? (keyword ? `/reception/loans?q=${encodeURIComponent(keyword)}` : '/reception/loans')
                : `/reception/loans?filter=${opt.value}${keyword ? `&q=${encodeURIComponent(keyword)}` : ''}`;
            return (
              <Link
                key={opt.value}
                href={href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-1 ${
                  isSelected
                    ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                aria-current={isSelected ? 'page' : undefined}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
        <Suspense fallback={<div className="h-10 flex-1 rounded border border-zinc-200 bg-zinc-50" />}>
          <LoanHistorySearchForm
            defaultValue={keyword}
            currentFilter={filter}
          />
        </Suspense>
      </div>

      <div className="mt-6">
        {loansWithCovers.length > 0 ? (
          <>
            {/* 狭い画面: 1件を2段カードで表示 */}
            <ul className="flex flex-col gap-4 md:hidden">
              {loansWithCovers.map((loan) => {
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
                  <li
                    key={loan.id}
                    className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
                  >
                    {/* 1段目: 利用者・状態・操作 */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-900 truncate">{user?.name ?? '—'}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email ?? ''}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            isActive ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {isActive ? '貸出中' : '返却済み'}
                        </span>
                        {isActive && <ReturnRequestByLoanButton loanId={loan.id} />}
                      </div>
                    </div>
                    {/* 2段目: 書籍・貸出日・返却日・日数 */}
                    <div className="flex gap-3 px-4 py-3">
                      <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-zinc-100">
                        <CoverImage
                          src={loan.coverUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          width={40}
                          height={56}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/books/${book?.id ?? '#'}`}
                          className="font-medium text-zinc-900 text-sm line-clamp-2 hover:underline"
                        >
                          {book?.title ?? '—'}
                        </Link>
                        <p className="text-xs text-zinc-500 mt-0.5">{book?.author ?? '—'}</p>
                        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-zinc-600">
                          <span>貸出日: {lentAtStr}</span>
                          <span>返却日: {returnedAtStr}</span>
                          <span>{days}日</span>
                        </dl>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* 広い画面: テーブル */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[600px] border-collapse rounded-lg border border-zinc-200 bg-white text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="px-4 py-2 text-left font-medium text-zinc-700">利用者</th>
                    <th className="px-4 py-2 text-left font-medium text-zinc-700">書籍</th>
                    <th className="px-4 py-2 text-left font-medium text-zinc-700">貸出日</th>
                    <th className="px-4 py-2 text-left font-medium text-zinc-700">返却日</th>
                    <th className="px-4 py-2 text-left font-medium text-zinc-700">貸出日数</th>
                    <th className="px-4 py-2 text-left font-medium text-zinc-700">状態</th>
                    <th className="px-4 py-2 text-left font-medium text-zinc-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loansWithCovers.map((loan) => {
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
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-8 shrink-0 overflow-hidden rounded bg-zinc-100">
                              <CoverImage
                                src={loan.coverUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                width={32}
                                height={48}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/books/${book?.id ?? '#'}`}
                                className="text-[13px] font-semibold text-zinc-900 hover:underline"
                              >
                                {book?.title ?? '—'}
                              </Link>
                              <span className="block text-[11px] text-zinc-500">
                                {book?.author ?? '—'}
                              </span>
                            </div>
                          </div>
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
                        <td className="px-4 py-2">
                          {isActive ? (
                            <ReturnRequestByLoanButton loanId={loan.id} />
                          ) : (
                            <span className="text-[11px] text-zinc-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalCount > 0 && (
              <PaginationNav
                totalCount={totalCount}
                pageSize={pageSize}
                currentPage={page}
                basePath="/reception/loans"
                searchParams={{
                  ...(filter !== 'all' && { filter }),
                  ...(keyword && { q: keyword }),
                }}
              />
            )}
          </>
        ) : (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
            該当する履歴はありません。
          </p>
        )}
      </div>
    </div>
  );
}
