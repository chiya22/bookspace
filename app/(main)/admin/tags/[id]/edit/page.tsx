import { getSession } from '@/lib/auth';
import { getTagById } from '@/lib/tags/queries';
import { updateTag } from '@/lib/actions/tags';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TagEditForm } from './TagEditForm';

export const metadata = {
  title: 'タグ名を変更 | ちよプラブックスペース',
};

export default async function AdminTagEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return null;
  }

  const { id } = await params;
  const tag = await getTagById(id);
  if (!tag) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">タグ名を変更</h1>
      <p className="mt-2 text-sm text-zinc-600">
        <Link href="/admin/tags" className="text-zinc-600 underline hover:text-zinc-900">
          タグ管理
        </Link>
        に戻る
      </p>
      <div className="mt-6 max-w-md">
        <TagEditForm tag={tag} action={updateTag} />
      </div>
    </div>
  );
}
