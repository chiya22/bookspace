'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { checkBookByIsbn } from '@/lib/actions/inventory';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:opacity-60 disabled:hover:bg-emerald-600"
    >
      {pending ? 'チェック中…' : 'チェック'}
    </button>
  );
}

export function InventoryCheckForm() {
  const [state, formAction] = useActionState(checkBookByIsbn, {});

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <label htmlFor="inventory-isbn" className="sr-only">
          ISBN
        </label>
        <input
          id="inventory-isbn"
          type="text"
          name="isbn"
          placeholder="ISBN（例: 978-4-00-xxx-x）"
          autoComplete="off"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 w-48"
        />
        <SubmitButton />
      </form>
      {state?.success && <span className="text-sm text-green-600">{state.success}</span>}
      {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
    </div>
  );
}
