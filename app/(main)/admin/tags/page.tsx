import { getSession } from '@/lib/auth';
import { getAllTags } from '@/lib/tags/queries';
import Link from 'next/link';
import { deleteTag } from '@/lib/actions/tags';
import { TagCreateForm } from './TagCreateForm';
import { TagDeleteForm } from './TagDeleteForm';

export const metadata = {
  title: 'タグ管理 | ちよプラブックスペース',
};

export default async function AdminTagsPage() {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return null;
  }

  const tags = await getAllTags();

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">タグ管理</h1>
      <p className="mt-2 text-sm text-zinc-600">
        タグの追加・名前変更・削除ができます。書籍編集画面でタグの付与・解除ができます。
      </p>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-medium text-zinc-700">新規タグを追加</h2>
        <TagCreateForm />
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-medium text-zinc-700">登録済みタグ</h2>
        {tags.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            タグがまだありません。上記フォームから追加するか、書籍編集画面でタグを付与するとここに表示されます。
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-zinc-900">{tag.name}</span>
                <span className="flex shrink-0 gap-3">
                  <Link
                    href={`/admin/tags/${tag.id}/edit`}
                    className="text-sm text-zinc-600 underline hover:text-zinc-900"
                  >
                    名前を変更
                  </Link>
                  <TagDeleteForm tagId={tag.id} tagName={tag.name} action={deleteTag} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-4 text-sm">
        <Link href="/admin" className="text-zinc-600 underline hover:text-zinc-900">
          管理メニューへ戻る
        </Link>
      </p>
    </div>
  );
}
