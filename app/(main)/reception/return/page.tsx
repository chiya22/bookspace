import { registerReturn } from '@/lib/actions/loans';
import { LoanReturnForm } from '@/components/reception/LoanReturnForm';

export const metadata = {
  title: '返却処理 | ちよプラブックスペース',
};

export default function ReceptionReturnPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">返却処理</h1>
      <p className="mt-2 text-sm text-zinc-600">
        ISBNと会員証QR（スキャン結果）を入力して返却を登録します。
      </p>
      <div className="mt-6">
        <LoanReturnForm mode="return" action={registerReturn} />
      </div>
    </div>
  );
}
