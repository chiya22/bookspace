import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'ログイン | ちよプラブックスペース',
  description: 'ログイン',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="rounded-lg bg-white p-6 shadow">読み込み中...</div>}>
      <LoginForm />
    </Suspense>
  );
}
