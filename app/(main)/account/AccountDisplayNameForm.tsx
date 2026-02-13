'use client';

import { useActionState } from 'react';
import { updateDisplayName } from '@/lib/actions/account';

type Props = {
  currentDisplayName: string;
};

export function AccountDisplayNameForm({ currentDisplayName }: Props) {
  const [state, formAction] = useActionState(updateDisplayName, {});

  return (
    <form action={formAction} className="mt-4 border-t border-zinc-200 pt-4">
      {state?.error && (
        <p className="mb-2 rounded bg-red-50 px-2 py-1 text-sm text-red-800">{state.error}</p>
      )}
      {state?.success && (
        <p className="mb-2 rounded bg-green-50 px-2 py-1 text-sm text-green-800">{state.success}</p>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-1 min-w-[200px] flex-col gap-1">
          <span className="text-xs text-zinc-500">表示名</span>
          <input
            type="text"
            name="display_name"
            defaultValue={currentDisplayName}
            placeholder="未入力の場合は名前が表示されます"
            className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          />
        </label>
        <button
          type="submit"
          className="shrink-0 rounded-full bg-emerald-700 px-4 py-1.5 text-[13px] font-medium text-white shadow-sm transition hover:bg-emerald-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
        >
          更新
        </button>
      </div>
    </form>
  );
}
