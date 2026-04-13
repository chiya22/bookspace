import { registerLoan } from '@/lib/actions/loans';
import { LoanReturnForm } from '@/components/reception/LoanReturnForm';
import { getSession } from '@/lib/auth';
import { getAllUsers } from '@/lib/users/queries';

export const metadata = {
  title: '貸出処理 | よブブラ',
};

export default async function ReceptionLoanPage() {
  const session = await getSession();
  const isAdmin = session?.user?.role === 'admin';

  const users = isAdmin
    ? (await getAllUsers()).filter((u) => !u.disabled).map((u) => ({
        id: u.id,
        name: u.name,
        displayName: u.display_name,
      }))
    : undefined;

  return (
    <div>
      <p className="text-sm text-zinc-600">
        {isAdmin
          ? 'ISBNを入力し、利用者を選択して貸出を登録します。1人1冊までです。'
          : 'ISBNと会員証QR（スキャン結果）を入力して貸出を登録します。1人1冊までです。'}
      </p>
      <div className="mt-6">
        <LoanReturnForm mode="loan" action={registerLoan} isAdmin={isAdmin} users={users} />
      </div>
    </div>
  );
}
