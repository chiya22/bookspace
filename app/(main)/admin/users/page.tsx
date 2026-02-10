import { getSession } from '@/lib/auth';
import { getAllUsers } from '@/lib/users/queries';
import Link from 'next/link';
import { ReturnRequestButton } from './ReturnRequestButton';

export const metadata = {
  title: '利用者管理 | ちよプラブックスペース',
};

const roleLabels: Record<string, string> = {
  user: '利用者',
  librarian: '受付者',
  admin: '管理者',
};

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return null;
  }

  const users = await getAllUsers();

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">利用者管理</h1>
      <p className="mt-2 text-sm text-zinc-600">
        利用者の一覧です。編集・無効化・返却依頼メールの送信ができます。
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
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="text-zinc-700 underline hover:text-zinc-900"
                    >
                      編集
                    </Link>
                    <ReturnRequestButton userId={user.id} userName={user.name} />
                  </div>
                </td>
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
