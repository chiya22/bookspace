'use client';

import { useActionState } from 'react';
import { createComment } from '@/lib/actions/comments';

type Props = {
  bookId: string;
};

export function BookCommentForm({ bookId }: Props) {
  const [state, formAction] = useActionState(createComment, {});

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="book_id" value={bookId} />
      {state?.error && (
        <p className="rounded bg-red-50 px-2 py-1 text-sm text-red-800">{state.error}</p>
      )}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-600">コメント（2000文字以内・登録後の編集はできません）</span>
        <textarea
          name="body"
          rows={3}
          required
          maxLength={2000}
          placeholder="コメントを入力してください"
          className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        />
      </label>
      <button
        type="submit"
        className="w-fit rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        コメントを投稿
      </button>
    </form>
  );
}
