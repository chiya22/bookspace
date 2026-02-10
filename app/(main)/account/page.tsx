import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { qrCodeToDataUrl } from '@/lib/qr/toDataUrl';
import { AccountDisplayNameForm } from './AccountDisplayNameForm';

export const metadata = {
  title: 'アカウント | ちよプラブックスペース',
  description: 'ユーザー情報・会員証QR',
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session?.user) return null;

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('users')
    .select('email, name, display_name, qr_code_data')
    .eq('id', session.user.id)
    .single();

  type UserRow = { email: string; name: string; display_name: string | null; qr_code_data: string | null };
  const user = data as UserRow | null;
  const qrDataUrl = user?.qr_code_data ? await qrCodeToDataUrl(user.qr_code_data) : null;
  const displayName = user?.display_name ?? user?.name ?? '-';

  const roleLabels: Record<string, string> = {
    user: '利用者',
    librarian: '受付者',
    admin: '管理者',
  };
  const roleLabel = roleLabels[session.user.role] ?? session.user.role;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-zinc-900">アカウント情報</h1>

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-700">会員証（QRコード）</h2>
        {qrDataUrl ? (
          <div className="inline-block rounded-lg border border-zinc-200 bg-white p-4">
            <img
              src={qrDataUrl}
              alt="会員証QRコード"
              width={256}
              height={256}
              className="block"
            />
          </div>
        ) : (
          <p className="text-sm text-zinc-500">QRコードを生成中です。</p>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="font-medium text-zinc-500">名前</dt>
            <dd className="text-zinc-900">{user?.name ?? '-'}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">表示名</dt>
            <dd className="text-zinc-900">{displayName}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">メール</dt>
            <dd className="text-zinc-900">{user?.email ?? '-'}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">役割</dt>
            <dd className="text-zinc-900">{roleLabel}</dd>
          </div>
        </dl>
        <AccountDisplayNameForm currentDisplayName={user?.display_name ?? ''} />
      </section>
    </div>
  );
}
