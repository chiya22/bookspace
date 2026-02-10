'use client';

import { useActionState } from 'react';
import { sendReturnRequestEmail } from '@/lib/actions/return-request';

export function ReturnRequestButton({ userId, userName }: { userId: string; userName: string }) {
  const [state, formAction] = useActionState(sendReturnRequestEmail, {});

  return (
    <span className="inline-flex items-center gap-1">
      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          className="text-sm text-zinc-600 underline hover:text-zinc-900"
          title={`${userName} 様に返却依頼メールを送信`}
        >
          返却依頼メール
        </button>
      </form>
      {state?.success && <span className="text-xs text-green-600">{state.success}</span>}
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </span>
  );
}
