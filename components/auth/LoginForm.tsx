'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const registered = searchParams.get('registered');
  const reset = searchParams.get('reset');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError('メールまたはパスワードが正しくありません。');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow">
      {registered === '1' && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800">
          会員登録が完了しました。ログインしてください。
        </p>
      )}
      {reset === '1' && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800">
          パスワードを変更しました。新しいパスワードでログインしてください。
        </p>
      )}
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
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
        <span className="text-sm font-medium text-zinc-700">パスワード</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 hover:shadow-md disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
      <p className="text-center text-sm text-zinc-600">
        <a href="/login/forgot-password" className="font-medium text-zinc-900 underline">
          パスワードを忘れた方
        </a>
      </p>
      <p className="text-center text-sm text-zinc-600">
        アカウントをお持ちでない方は{' '}
        <a href="/register" className="font-medium text-zinc-900 underline">
          会員登録
        </a>
      </p>
    </form>
  );
}
