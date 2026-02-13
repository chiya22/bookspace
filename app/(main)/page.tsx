import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { qrCodeToDataUrl } from '@/lib/qr/toDataUrl';
import { getCoverSignedUrl, getNdlThumbnailUrl } from '@/lib/books/cover';
import { getPageSize, parsePage, sliceForPage } from '@/lib/pagination';
import { PaginationNav } from '@/components/PaginationNav';
import { CoverImage } from '@/components/books/CoverImage';
import Link from 'next/link';

export const metadata = {
  title: 'トップ | ちよプラブックスペース',
  description: '会員証QR・貸出中一覧',
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function TopPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.user) return null;

  const resolved = await searchParams;
  const pageSize = getPageSize();
  const page = parsePage(resolved);

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase
    .from('users')
    .select('qr_code_data')
    .eq('id', session.user.id)
    .single();

  type UserQrRow = { qr_code_data: string | null };
  const user = userData as UserQrRow | null;

  const { data: loansData } = await supabase
    .from('loans')
    .select(
      `
      id,
      lent_at,
      books ( id, title, author, isbn, cover_image_path )
    `
    )
    .eq('user_id', session.user.id)
    .is('returned_at', null)
    .order('lent_at', { ascending: false });

  type LoanWithBook = {
    id: string;
    lent_at: string;
    books: { id: string; title: string; author: string; isbn: string; cover_image_path: string | null } | null;
  };
  const allLoans = (loansData ?? []) as LoanWithBook[];
  const totalCount = allLoans.length;
  const pagedLoans = sliceForPage(allLoans, page, pageSize);

  const loansWithCovers = await Promise.all(
    pagedLoans.map(async (loan) => {
      const book = loan.books;
      if (!book) return { ...loan, coverUrl: null as string | null };
      const uploaded = await getCoverSignedUrl(book.cover_image_path);
      const coverUrl = uploaded ?? (getNdlThumbnailUrl(book.isbn) || null);
      return { ...loan, coverUrl };
    })
  );

  const qrDataUrl =
    user?.qr_code_data != null ? await qrCodeToDataUrl(user.qr_code_data) : null;

  return (
    <div className="flex flex-col gap-8">
      <section>
        {qrDataUrl ? (
          <div className="inline-block rounded-lg border border-zinc-200 bg-white p-4">
            <img
              src={qrDataUrl}
              alt="会員証QRコード"
              width={256}
              height={256}
              className="block"
            />
          </div>
        ) : (
          <p className="text-sm text-zinc-500">QRコードを生成中です。</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-700">現在貸出中の書籍</h2>
        {totalCount > 0 ? (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {loansWithCovers.map((loan) => {
              const book = loan.books;
              const lentAt = loan.lent_at
                ? new Date(loan.lent_at).toLocaleDateString('ja-JP')
                : '';
              const days =
                loan.lent_at
                  ? Math.floor(
                      (Date.now() - new Date(loan.lent_at).getTime()) / (24 * 60 * 60 * 1000)
                    )
                  : 0;
              return (
                <li key={loan.id}>
                  <Link
                    href={`/books/${book?.id ?? '#'}`}
                    className="flex gap-3 px-4 py-2.5 transition hover:bg-zinc-50"
                  >
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
                      <div className="text-xs font-medium text-zinc-900 line-clamp-2">
                        {book?.title ?? '-'}
                      </div>
                      <div className="mt-0.5 text-[11px] text-zinc-600">
                        {book?.author}（貸出日: {lentAt}・{days}日目）
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
            現在貸出中の書籍はありません。
          </p>
        )}
        {totalCount > 0 && (
          <PaginationNav
            totalCount={totalCount}
            pageSize={pageSize}
            currentPage={page}
            basePath="/"
          />
        )}
      </section>
    </div>
  );
}
