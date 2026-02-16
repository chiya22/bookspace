'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

type Props = {
  mode: 'loan';
  action: (prev: { error?: string; success?: string }, fd: FormData) => Promise<{ error?: string; success?: string }>;
} | {
  mode: 'return';
  action: (prev: { error?: string; success?: string }, fd: FormData) => Promise<{ error?: string; success?: string }>;
};

function SubmitButton({ isLoan }: { isLoan: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`rounded-full px-5 py-1.5 text-[13px] font-medium text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 disabled:pointer-events-none disabled:opacity-70 ${
        isLoan ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-zinc-800 hover:bg-zinc-700'
      }`}
    >
      {pending ? '処理中…' : isLoan ? '貸出' : '返却'}
    </button>
  );
}

export function LoanReturnForm({ mode, action }: Props) {
  const [state, formAction] = useActionState(action, {});

  const isLoan = mode === 'loan';

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          {state.success}
        </p>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700">書籍のISBN</label>
        <input
          type="text"
          name="isbn"
          placeholder="978-4-..."
          required
          autoFocus
          className="w-full rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700">
          会員証QRコード（スキャン結果）
        </label>
        <textarea
          name="qr_data"
          rows={3}
          placeholder='{"userId":"...","name":"..."} の形式でスキャン結果を貼り付けてください'
          className="w-full rounded border border-zinc-300 px-3 py-2 font-mono text-[13px] text-zinc-900"
        />
        <p className="mt-1 text-xs text-zinc-500">
          QRスキャンで取得した文字列をそのまま貼り付けるか、利用者IDのみを入力してください。
        </p>
      </div>
      <SubmitButton isLoan={isLoan} />
    </form>
  );
}
