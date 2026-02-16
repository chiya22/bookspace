import Link from 'next/link';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata = {
  title: 'パスワードの再設定 | ちよプラブックスペース',
  description: '新しいパスワードを設定',
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const token = typeof resolved.token === 'string' ? resolved.token : '';

  return (
    <div className="flex flex-col gap-4">
      <ResetPasswordForm token={token} />
      <p className="text-center text-sm text-zinc-600">
        <Link href="/login" className="font-medium text-zinc-900 underline">
          ログインに戻る
        </Link>
      </p>
    </div>
  );
}
