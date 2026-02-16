import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'パスワードを忘れた方 | ちよプラブックスペース',
  description: 'パスワードリセット用メールを送信',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-4">
      <ForgotPasswordForm />
      <p className="text-center text-sm text-zinc-600">
        <Link href="/login" className="font-medium text-zinc-900 underline">
          ログインに戻る
        </Link>
      </p>
    </div>
  );
}
