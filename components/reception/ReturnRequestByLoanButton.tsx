'use client';

import { useActionState } from 'react';
import { sendReturnRequestEmail } from '@/lib/actions/return-request';

export function ReturnRequestByLoanButton({ loanId }: { loanId: string }) {
  const [state, formAction] = useActionState(sendReturnRequestEmail, {});

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <form action={formAction}>
        <input type="hidden" name="loanId" value={loanId} />
        <button
          type="submit"
          className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/70"
          title="返却依頼メールを送信"
        >
          返却依頼メール
        </button>
      </form>
      {state?.success && <span className="text-[11px] text-green-600">{state.success}</span>}
      {state?.error && <span className="text-[11px] text-red-600">{state.error}</span>}
    </span>
  );
}
