import { getSession } from '@/lib/auth';
import { getTagsPaginated, getBookCountByTagIds } from '@/lib/tags/queries';
import { getPageSize, parsePage } from '@/lib/pagination';
import { PaginationNav } from '@/components/PaginationNav';
import Link from 'next/link';
import { deleteTag } from '@/lib/actions/tags';
import { TagCreateForm } from './TagCreateForm';
import { TagDeleteForm } from './TagDeleteForm';

export const metadata = {
  title: 'タグ管理 | ちよプラブックスペース',
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminTagsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return null;
  }

  const resolved = await searchParams;
  const pageSize = getPageSize();
  const page = parsePage(resolved);
  const { tags, totalCount } = await getTagsPaginated(page, pageSize);
  const bookCountByTagId = await getBookCountByTagIds(tags.map((t) => t.id));

  return (
    <div>
      <p className="text-sm text-zinc-600">
        タグの追加・名前変更・削除ができます。書籍編集画面でタグの付与・解除ができます。
      </p>

      <section className="mt-6">
        <TagCreateForm />
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-medium text-zinc-700">登録済みタグ</h2>
        {tags.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            タグがまだありません。上記フォームから追加するか、書籍編集画面でタグを付与するとここに表示されます。
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white text-sm">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold text-zinc-900">{tag.name}</span>
                  <span className="text-[11px] text-zinc-500">
                    （{bookCountByTagId.get(tag.id) ?? 0}件）
                  </span>
                </span>
                <span className="flex shrink-0 gap-2 text-[11px]">
                  <Link
                    href={`/admin/tags/${tag.id}/edit`}
                    className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 shadow-sm transition hover:border-emerald-500/60 hover:text-emerald-800"
                  >
                    名前を変更
                  </Link>
                  <TagDeleteForm tagId={tag.id} tagName={tag.name} action={deleteTag} />
                </span>
              </li>
            ))}
          </ul>
        )}
        {totalCount > 0 && (
          <PaginationNav
            totalCount={totalCount}
            pageSize={pageSize}
            currentPage={page}
            basePath="/admin/tags"
          />
        )}
      </section>
      <p className="mt-4 text-sm">
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
