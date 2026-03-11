'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createComment } from '@/lib/actions/comments';

type Props = {
  bookId: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-fit rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 disabled:hover:bg-zinc-900"
    >
      {pending ? '投稿中…' : 'コメントを投稿'}
    </button>
  );
}

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
      <SubmitButton />
    </form>
  );
}
