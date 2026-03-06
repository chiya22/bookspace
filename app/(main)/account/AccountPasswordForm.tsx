'use client';

import { useActionState } from 'react';
import { changePassword } from '@/lib/actions/account';

export function AccountPasswordForm() {
  const [state, formAction] = useActionState(changePassword, {});

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4 border-t border-zinc-200 pt-4">
      <p className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <strong>ご注意：</strong>パスワードを変更すると、セキュリティのため<strong>自動的にログアウト</strong>します。変更後は<strong>新しいパスワードで再度ログイン</strong>してください。
      </p>
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">現在のパスワード</span>
          <input
            type="password"
            name="current_password"
            autoComplete="current-password"
            required
            className="rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">新しいパスワード（8文字以上）</span>
          <input
            type="password"
            name="new_password"
            autoComplete="new-password"
            required
            minLength={8}
            className="rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">新しいパスワード（確認）</span>
          <input
            type="password"
            name="new_password_confirm"
            autoComplete="new-password"
            required
            minLength={8}
            className="rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
          />
        </label>
      </div>
      <button
        type="submit"
        className="w-fit rounded-full bg-zinc-800 px-5 py-1.5 text-[13px] font-medium text-white shadow-sm transition hover:bg-zinc-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
      >
        パスワードを変更する
      </button>
    </form>
  );
}
