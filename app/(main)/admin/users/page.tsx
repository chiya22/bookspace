import { getSession } from '@/lib/auth';
import { getUsersPaginated } from '@/lib/users/queries';
import { getPageSize, parsePage } from '@/lib/pagination';
import { PaginationNav } from '@/components/PaginationNav';
import Link from 'next/link';

export const metadata = {
  title: '利用者管理 | ちよプラブックスペース',
};

const roleLabels: Record<string, string> = {
  user: '利用者',
  librarian: '受付者',
  admin: '管理者',
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return null;
  }

  const resolved = await searchParams;
  const pageSize = getPageSize();
  const page = parsePage(resolved);
  const { users, totalCount } = await getUsersPaginated(page, pageSize);

  return (
    <div>
      <p className="text-sm text-zinc-600">
        利用者の一覧です。編集・無効化ができます。
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse rounded-lg border border-zinc-200 bg-white text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-2 text-left font-medium text-zinc-700">名前</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-700">メール</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-700">役割</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-700">状態</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-100">
                <td className="px-4 py-2 text-zinc-900">{user.name}</td>
                <td className="px-4 py-2 text-zinc-600">{user.email}</td>
                <td className="px-4 py-2 text-zinc-600">{roleLabels[user.role] ?? user.role}</td>
                <td className="px-4 py-2">
                  {user.disabled ? (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
                      無効
                    </span>
                  ) : (
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      有効
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex flex-wrap items-center gap-1">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 shadow-sm transition hover:border-emerald-500/60 hover:text-emerald-800"
                    >
                      詳細
                    </Link>
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 shadow-sm transition hover:border-emerald-500/60 hover:text-emerald-800"
                    >
                      編集
                    </Link>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationNav
        totalCount={totalCount}
        pageSize={pageSize}
        currentPage={page}
        basePath="/admin/users"
      />
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
