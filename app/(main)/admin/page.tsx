import Link from 'next/link';

export const metadata = {
  title: '管理 | ちよプラブックスペース',
};

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">管理メニュー</h1>
      <ul className="mt-4 flex flex-col gap-2 text-sm">
        <li>
          <Link href="/admin/books" className="text-zinc-700 underline hover:text-zinc-900">
            蔵書管理
          </Link>
        </li>
        <li>
          <Link href="/admin/users" className="text-zinc-700 underline hover:text-zinc-900">
            利用者管理
          </Link>
        </li>
        <li>
          <Link href="/admin/inventory" className="text-zinc-700 underline hover:text-zinc-900">
            棚卸
          </Link>
        </li>
        <li>
          <Link href="/admin/tags" className="text-zinc-700 underline hover:text-zinc-900">
            タグ管理
          </Link>
        </li>
      </ul>
    </div>
  );
}
