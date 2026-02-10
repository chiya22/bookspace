import { getSession } from '@/lib/auth';
import { getBooksWithLoanStatus } from '@/lib/inventory/queries';
import Link from 'next/link';

export const metadata = {
  title: '棚卸 | ちよプラブックスペース',
  description: '蔵書の一覧・貸出状態確認',
};

export default async function AdminInventoryPage() {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return null;
  }

  const books = await getBooksWithLoanStatus();
  const loanedCount = books.filter((b) => b.status === 'loaned').length;
  const availableCount = books.length - loanedCount;

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">棚卸</h1>
      <p className="mt-2 text-sm text-zinc-600">
        蔵書の一覧と貸出状態を確認できます。
      </p>
      <div className="mt-4 flex gap-4 text-sm">
        <span className="text-zinc-600">在庫: <strong className="text-zinc-900">{availableCount}</strong> 冊</span>
        <span className="text-zinc-600">貸出中: <strong className="text-zinc-900">{loanedCount}</strong> 冊</span>
        <span className="text-zinc-600">合計: <strong className="text-zinc-900">{books.length}</strong> 冊</span>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse rounded-lg border border-zinc-200 bg-white text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-2 text-left font-medium text-zinc-700">タイトル</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-700">著者</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-700">ISBN</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-700">状態</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-700">借受人</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-b border-zinc-100">
                <td className="px-4 py-2">
                  <Link
                    href={`/books/${book.id}`}
                    className="font-medium text-zinc-900 hover:underline"
                  >
                    {book.title}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-600">{book.author}</td>
                <td className="px-4 py-2 text-zinc-600">{book.isbn}</td>
                <td className="px-4 py-2">
                  {book.status === 'loaned' ? (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                      貸出中
                    </span>
                  ) : (
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      在庫
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-zinc-600">{book.borrowedBy ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm">
        <Link href="/admin" className="text-zinc-600 underline hover:text-zinc-900">
          管理メニューへ戻る
        </Link>
      </p>
    </div>
  );
}
