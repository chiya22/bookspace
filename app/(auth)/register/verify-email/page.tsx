import Link from 'next/link';
import { completeRegistrationWithToken } from '@/lib/actions/verify-email';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'メールアドレスの確認 | ちよプラブックスペース',
  description: '会員登録の完了',
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function VerifyEmailPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const token = typeof resolved.token === 'string' ? resolved.token : '';

  if (!token) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-lg font-semibold text-zinc-900">メールアドレスの確認</h1>
        <p className="mt-3 text-sm text-red-800">
          リンクが無効です。会員登録から再度お試しください。
        </p>
        <p className="mt-4">
          <Link href="/register" className="text-sm font-medium text-zinc-900 underline">
            会員登録に戻る
          </Link>
        </p>
      </div>
    );
  }

  const result = await completeRegistrationWithToken(token);

  if (result.ok) {
    redirect('/login?registered=1');
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h1 className="text-lg font-semibold text-zinc-900">メールアドレスの確認</h1>
      <p className="mt-3 text-sm text-red-800">{result.error}</p>
      <p className="mt-4">
        <Link href="/register" className="text-sm font-medium text-zinc-900 underline">
          会員登録に戻る
        </Link>
        {' · '}
        <Link href="/login" className="text-sm font-medium text-zinc-900 underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}
