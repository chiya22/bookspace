'use client';

import { useActionState } from 'react';
import { requestPasswordReset, type RequestResetState } from '@/lib/actions/password-reset';

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, {} as RequestResetState);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow">
      <h1 className="text-lg font-semibold text-zinc-900">パスワードを忘れた方</h1>
      <p className="text-sm text-zinc-600">
        登録済みのメールアドレスを入力してください。パスワードをリセットするためのリンクをお送りします。
      </p>
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800">{state.success}</p>
      )}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">メールアドレス</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
      >
        リセット用メールを送信
      </button>
    </form>
  );
}
