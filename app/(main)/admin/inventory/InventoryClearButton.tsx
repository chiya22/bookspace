'use client';

import { useActionState } from 'react';
import { clearInventoryChecks } from '@/lib/actions/inventory';

export function InventoryClearButton() {
  const [state, formAction] = useActionState(
    async (_prev: { error?: string; success?: string }, _formData: FormData) => {
      return clearInventoryChecks();
    },
    {}
  );

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <form action={formAction}>
        <button
          type="submit"
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1"
        >
          在庫チェック履歴をクリア
        </button>
      </form>
      {state?.success && <span className="text-sm text-green-600">{state.success}</span>}
      {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
    </span>
  );
}
