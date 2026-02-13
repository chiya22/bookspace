import { getSession } from '@/lib/auth';
import { getLoansByUserIdPaginated } from '@/lib/loans/queries';
import { getPageSize, parsePage } from '@/lib/pagination';
import { PaginationNav } from '@/components/PaginationNav';
import Link from 'next/link';
import { getCoverSignedUrl, getNdlThumbnailUrl } from '@/lib/books/cover';
import { CoverImage } from '@/components/books/CoverImage';

export const metadata = {
  title: '貸出履歴 | ちよプラブックスペース',
  description: '自分の貸出・返却履歴',
};

function loanDays(lentAt: string, returnedAt: string | null): number {
  const end = returnedAt ? new Date(returnedAt).getTime() : Date.now();
  return Math.floor((end - new Date(lentAt).getTime()) / (24 * 60 * 60 * 1000));
}

type Props = { searchParams: Promise<{ page?: string }> };

export default async function MyLoansPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.user) return null;

  const resolved = await searchParams;
  const pageSize = getPageSize();
  const page = parsePage(resolved);
  const { loans, totalCount } = await getLoansByUserIdPaginated(session.user.id, page, pageSize);

  const loansWithCovers = await Promise.all(
    loans.map(async (loan) => {
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
        これまでに借りた書籍の履歴です。貸出中・返却済みを一覧で確認できます。
      </p>
      <div className="mt-6">
        {loansWithCovers.length > 0 ? (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white text-sm">
            {loansWithCovers.map((loan) => {
              const book = loan.books;
              const lentAtStr = loan.lent_at
                ? new Date(loan.lent_at).toLocaleDateString('ja-JP')
                : '—';
              const returnedAtStr = loan.returned_at
                ? new Date(loan.returned_at).toLocaleDateString('ja-JP')
                : '—';
              const days = loanDays(loan.lent_at, loan.returned_at);
              const isActive = !loan.returned_at;
              return (
                <li key={loan.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-11 shrink-0 overflow-hidden rounded bg-zinc-100">
                        <CoverImage
                          src={loan.coverUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          width={44}
                          height={64}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/books/${book?.id ?? '#'}`}
                          className="text-[13px] font-semibold text-zinc-900 hover:underline"
                        >
                          {book?.title ?? '—'}
                        </Link>
                        <div className="text-[11px] text-zinc-600">
                          {book?.author ?? '—'}
                          {book?.isbn && `（ISBN: ${book.isbn}）`}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                        isActive ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {isActive ? '貸出中' : '返却済み'}
                    </span>
                  </div>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px] text-zinc-600">
                    <dt>貸出日:</dt>
                    <dd>{lentAtStr}</dd>
                    <dt>返却日:</dt>
                    <dd>{returnedAtStr}</dd>
                    <dt>貸出日数:</dt>
                    <dd>{days}日</dd>
                  </dl>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
            貸出履歴はまだありません。
          </p>
        )}
      </div>
      {totalCount > 0 && (
        <PaginationNav
          totalCount={totalCount}
          pageSize={pageSize}
          currentPage={page}
          basePath="/loans"
        />
      )}
    </div>
  );
}
