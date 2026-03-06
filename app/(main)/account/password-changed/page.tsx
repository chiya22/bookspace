'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

/**
 * パスワード変更後にリダイレクトされる中間ページ。
 * セキュリティのため即座にログアウトし、ログイン画面へ誘導する。
 */
export default function AccountPasswordChangedPage() {
  useEffect(() => {
    signOut({ callbackUrl: '/login?reset=1' });
  }, []);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
      <p>パスワードを変更しました。ログアウトしてログイン画面へ移動しています…</p>
    </div>
  );
}
