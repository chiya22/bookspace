import { getSession } from '@/lib/auth';
import {
  getBooksNotChecked,
  getCheckedBookIds,
  getLastInventoryClearedAt,
} from '@/lib/inventory/queries';
import { getPageSize, parsePage, sliceForPage } from '@/lib/pagination';
import { PaginationNav } from '@/components/PaginationNav';
import Link from 'next/link';
import { InventoryClearButton } from './InventoryClearButton';
import { InventoryCheckForm } from './InventoryCheckForm';

export const metadata = {
  title: '棚卸 | ちよプラブックスペース',
  description: '在庫チェック・棚卸',
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminInventoryPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return null;
  }

  const resolved = await searchParams;
  const pageSize = getPageSize();
  const page = parsePage(resolved);

  const [uncheckedBooks, checkedIds, lastClearedAt] = await Promise.all([
    getBooksNotChecked(),
    getCheckedBookIds(),
    getLastInventoryClearedAt(),
  ]);
  const totalCount = uncheckedBooks.length + checkedIds.size;
  const uncheckedTotal = uncheckedBooks.length;
  const pagedUnchecked = sliceForPage(uncheckedBooks, page, pageSize);
  const checkedCount = checkedIds.size;
  const lastClearedAtStr = lastClearedAt
    ? `${lastClearedAt.getFullYear()}年${lastClearedAt.getMonth() + 1}月${lastClearedAt.getDate()}日 ${String(lastClearedAt.getHours()).padStart(2, '0')}:${String(lastClearedAt.getMinutes()).padStart(2, '0')}:${String(lastClearedAt.getSeconds()).padStart(2, '0')}`
    : null;

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-zinc-600">
        在庫チェック履歴のクリア → ISBNでチェック → 未チェックの書籍を確認できます。
      </p>

      {/* 最終クリア日時 */}
      {lastClearedAtStr && (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700">
          最後に在庫チェック履歴をクリアした日時: <strong>{lastClearedAtStr}</strong>
        </p>
      )}

      {/* 1) 在庫チェック履歴のクリア */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-800">1. 在庫チェック履歴のクリア</h2>
        <p className="mb-2 text-xs text-zinc-500">
          これまでの在庫チェック履歴をすべて削除し、棚卸を最初から行います。
        </p>
        <InventoryClearButton />
      </section>

      {/* 2) 在庫チェックの実施 */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-800">2. 在庫チェックの実施</h2>
        <p className="mb-2 text-xs text-zinc-500">
          ISBNを入力して「チェック」を押すと、その書籍が在庫にあることを記録します。
        </p>
        <InventoryCheckForm />
      </section>

      {/* 3) 未チェックの書籍（在庫チェック履歴が存在しない書籍） */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-800">3. 未チェックの書籍</h2>
        <p className="mb-3 text-xs text-zinc-500">
          チェック済み: <strong className="text-zinc-900">{checkedCount}</strong> 冊 / 合計{' '}
          <strong className="text-zinc-900">{totalCount}</strong> 冊
          {uncheckedTotal > 0 &&
            ` — 以下の ${uncheckedTotal} 冊はまだ在庫チェック履歴がありません。`}
        </p>
        {uncheckedTotal > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse rounded-lg border border-zinc-200 bg-white text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-2 text-left font-medium text-zinc-700">タイトル</th>
                  <th className="px-4 py-2 text-left font-medium text-zinc-700">著者</th>
                  <th className="px-4 py-2 text-left font-medium text-zinc-700">ISBN</th>
                  <th className="px-4 py-2 text-left font-medium text-zinc-700">状態</th>
                </tr>
              </thead>
              <tbody>
                {pagedUnchecked.map((book) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {uncheckedTotal > 0 && (
          <PaginationNav
            totalCount={uncheckedTotal}
            pageSize={pageSize}
            currentPage={page}
            basePath="/admin/inventory"
          />
        )}
        {uncheckedTotal === 0 && (
          <p className="rounded-lg border border-zinc-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {totalCount === 0
              ? '登録されている書籍がありません。'
              : 'すべての書籍の在庫チェックが完了しています。'}
          </p>
        )}
      </section>

      <p className="text-sm">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] text-zinc-700 shadow-sm transition hover:border-emerald-500/50 hover:text-emerald-800 hover:shadow-md"
        >
          <span className="text-xs">←</span>
          <span>管理メニューへ戻る</span>
        </Link>
      </p>
    </div>
  );
}
