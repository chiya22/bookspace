'use client';

import { useActionState } from 'react';
import { registerUser } from '@/lib/actions/register';

export function RegisterForm() {
  const [state, formAction] = useActionState(registerUser, {});

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow">
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800">{state.success}</p>
      )}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">メール</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">パスワード（8文字以上）</span>
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
        <span className="text-sm font-medium text-zinc-700">名前</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          className="rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">表示名（任意）</span>
        <input
          name="display_name"
          type="text"
          autoComplete="nickname"
          placeholder="未入力の場合は名前が使われます"
          className="rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
      >
        新規登録
      </button>
      <p className="text-center text-sm text-zinc-600">
        すでにアカウントをお持ちの方は{' '}
        <a href="/login" className="font-medium text-zinc-900 underline">
          ログイン
        </a>
      </p>
    </form>
  );
}
