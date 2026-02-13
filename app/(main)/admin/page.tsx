import Link from 'next/link';

export const metadata = {
  title: '管理 | ちよプラブックスペース',
};

const menuItems = [
  {
    href: '/admin/books',
    label: '蔵書管理',
    description: '書籍の登録・編集・削除',
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: '利用者管理',
    description: '利用者の編集・無効化',
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/inventory',
    label: '棚卸',
    description: '蔵書一覧・貸出状態の確認',
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: '/admin/tags',
    label: 'タグ管理',
    description: 'タグの作成・編集・削除',
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
] as const;

export default function AdminPage() {
  return (
    <div>
      <p className="mb-6 text-sm text-zinc-600">
        管理メニューから項目を選んでください。
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {menuItems.map(({ href, label, description, icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-500/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                {icon}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block font-medium text-zinc-900">{label}</span>
                <span className="mt-0.5 block text-sm text-zinc-500">{description}</span>
              </div>
              <span className="shrink-0 self-center text-zinc-400" aria-hidden>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
