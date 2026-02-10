'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';

type MainNavProps = {
  name: string | null;
  role: string;
};

export function MainNav({ name, role }: MainNavProps) {
  const isStaff = role === 'librarian' || role === 'admin';

  return (
    <nav className="border-b border-zinc-200 bg-white" aria-label="メインメニュー">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-zinc-900">
            ちよプラブックスペース
          </Link>
          <Link href="/books" className="text-sm text-zinc-600 hover:text-zinc-900">
            蔵書検索
          </Link>
          <Link href="/loans" className="text-sm text-zinc-600 hover:text-zinc-900">
            貸出履歴
          </Link>
          <Link href="/account" className="text-sm text-zinc-600 hover:text-zinc-900">
            アカウント
          </Link>
          {isStaff && (
            <>
              <Link
                href="/reception/loan"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                貸出
              </Link>
              <Link
                href="/reception/return"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                返却
              </Link>
              <Link
                href="/reception/loans"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                貸出履歴一覧
              </Link>
              <Link
                href="/admin"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                管理
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">{name ?? ''}</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm text-zinc-600 hover:text-zinc-900"
            aria-label="ログアウト"
          >
            ログアウト
          </button>
        </div>
      </div>
    </nav>
  );
}
