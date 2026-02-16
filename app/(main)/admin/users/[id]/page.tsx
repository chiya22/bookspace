import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/users/queries';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: '利用者詳細 | ちよプラブックスペース',
};

const roleLabels: Record<string, string> = {
  user: '利用者',
  librarian: '受付者',
  admin: '管理者',
};

export default async function AdminUserDetailPage({
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
      <p className="text-sm text-zinc-600">
        <Link href="/admin/users" className="text-zinc-600 underline hover:text-zinc-900">
          利用者管理
        </Link>
        に戻る
      </p>
      <div className="mt-6 max-w-md">
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-medium text-zinc-800">アカウント詳細</h2>
          <dl className="grid gap-3 text-[11px]">
            <div>
              <dt className="text-xs text-zinc-500">名前</dt>
              <dd className="text-sm text-zinc-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">メール</dt>
              <dd className="text-sm text-zinc-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">役割</dt>
              <dd className="text-sm text-zinc-900">{roleLabels[user.role] ?? user.role}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">状態</dt>
              <dd className="text-sm text-zinc-900">
                {user.disabled ? (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">無効</span>
                ) : (
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">有効</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">登録日</dt>
              <dd className="text-sm text-zinc-900">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString('ja-JP')
                  : '-'}
              </dd>
            </div>
          </dl>
        </section>
        <p className="mt-4">
          <Link
            href={`/admin/users/${id}/edit`}
            className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1.5 text-[13px] text-zinc-700 shadow-sm transition hover:border-emerald-500/60 hover:text-emerald-800"
          >
            名前・メール・役割・無効化を編集
          </Link>
        </p>
      </div>
    </div>
  );
}
