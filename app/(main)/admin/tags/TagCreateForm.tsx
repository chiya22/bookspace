'use client';

import { useActionState } from 'react';
import { createTag, type UpdateTagState } from '@/lib/actions/tags';

export function TagCreateForm() {
  const [state, formAction] = useActionState(createTag, {} as UpdateTagState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {state?.error && (
        <p className="w-full rounded bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      )}
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="new-tag-name" className="mb-1 block text-sm font-medium text-zinc-700">
          新しいタグ名
        </label>
        <input
          id="new-tag-name"
          type="text"
          name="name"
          required
          placeholder="例: プログラミング"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        追加
      </button>
    </form>
  );
}
