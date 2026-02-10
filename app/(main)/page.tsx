import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { qrCodeToDataUrl } from '@/lib/qr/toDataUrl';

export const metadata = {
  title: 'トップ | ちよプラブックスペース',
  description: '会員証QR・貸出中一覧',
};

export default async function TopPage() {
  const session = await getSession();
  if (!session?.user) return null;

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
      books ( id, title, author, isbn )
    `
    )
    .eq('user_id', session.user.id)
    .is('returned_at', null)
    .order('lent_at', { ascending: false });

  type LoanWithBook = {
    id: string;
    lent_at: string;
    books: { id: string; title: string; author: string; isbn: string } | null;
  };
  const loans = (loansData ?? []) as LoanWithBook[];

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
        {loans.length > 0 ? (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {loans.map((loan) => {
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
                <li key={loan.id} className="px-4 py-3">
                  <div className="font-medium text-zinc-900">{book?.title ?? '-'}</div>
                  <div className="text-sm text-zinc-600">
                    {book?.author}（貸出日: {lentAt}・{days}日目）
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            現在貸出中の書籍はありません。
          </p>
        )}
      </section>
    </div>
  );
}
