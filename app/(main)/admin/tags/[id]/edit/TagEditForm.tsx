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
        <label className="mb-1 block text-sm font-medium text-zinc-700">タグ名</label>
        <input
          type="text"
          name="name"
          defaultValue={tag.name}
          required
          autoFocus
          className="w-full rounded border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          保存
        </button>
        <Link
          href="/admin/tags"
          className="rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
