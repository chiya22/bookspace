'use client';

import { useActionState } from 'react';
import { resetPassword, type ResetPasswordState } from '@/lib/actions/password-reset';

type Props = { token: string };

export function ResetPasswordForm({ token }: Props) {
  const [state, formAction] = useActionState(resetPassword, {} as ResetPasswordState);

  if (!token) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-sm text-red-800">
          リセット用のリンクが無効です。パスワードを忘れた方から再度手続きしてください。
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow">
      <h1 className="text-lg font-semibold text-zinc-900">新しいパスワードを設定</h1>
      <p className="text-sm text-zinc-600">
        8文字以上の新しいパスワードを入力してください。
      </p>
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      )}
      <input type="hidden" name="token" value={token} />
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">新しいパスワード</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">パスワード（確認）</span>
        <input
          name="password_confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
          aria-describedby="password-match-desc"
        />
        <span id="password-match-desc" className="text-xs text-zinc-500">
          同じパスワードを再入力してください
        </span>
      </label>
      <button
        type="submit"
        className="w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
      >
        パスワードを更新
      </button>
    </form>
  );
}
