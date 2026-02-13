'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { TagRow } from '@/lib/tags/queries';
import type { UpdateTagState } from '@/lib/actions/tags';

type TagEditFormProps = {
  tag: TagRow;
  action: (prev: UpdateTagState, formData: FormData) => Promise<UpdateTagState>;
};

export function TagEditForm({ tag, action }: TagEditFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="tagId" value={tag.id} readOnly aria-hidden />
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700">タグ名</label>
        <input
          type="text"
          name="name"
          defaultValue={tag.name}
          required
          autoFocus
          className="w-full rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-emerald-700 px-5 py-1.5 text-[13px] font-medium text-white shadow-sm transition hover:bg-emerald-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
        >
          更新
        </button>
        <Link
          href="/admin/tags"
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-[13px] text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/70"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
