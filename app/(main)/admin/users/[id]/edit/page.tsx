import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/users/queries';
import { updateUser } from '@/lib/actions/users';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { UserEditForm } from './UserEditForm';

export const metadata = {
  title: '利用者編集 | ちよプラブックスペース',
};

export default async function AdminUserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return null;
  }

  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">利用者編集</h1>
      <p className="mt-2 text-sm text-zinc-600">
        <Link href="/admin/users" className="text-zinc-600 underline hover:text-zinc-900">
          利用者管理
        </Link>
        に戻る
      </p>
      <div className="mt-6 max-w-md">
        <UserEditForm user={user} action={updateUser} />
      </div>
    </div>
  );
}
