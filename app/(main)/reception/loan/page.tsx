import { registerLoan } from '@/lib/actions/loans';
import { LoanReturnForm } from '@/components/reception/LoanReturnForm';

export const metadata = {
  title: '貸出処理 | ちよプラブックスペース',
};

export default function ReceptionLoanPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">貸出処理</h1>
      <p className="mt-2 text-sm text-zinc-600">
        ISBNと会員証QR（スキャン結果）を入力して貸出を登録します。1人1冊までです。
      </p>
      <div className="mt-6">
        <LoanReturnForm mode="loan" action={registerLoan} />
      </div>
    </div>
  );
}
