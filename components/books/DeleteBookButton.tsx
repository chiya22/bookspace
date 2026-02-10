'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBook } from '@/lib/actions/books';

type Props = {
  bookId: string;
  bookTitle: string;
};

export function DeleteBookButton({ bookId, bookTitle }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setError('');
    const result = await deleteBook(bookId);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push('/admin/books');
    router.refresh();
  }

  return (
    <div>
      <h2 className="mb-2 text-sm font-medium text-zinc-700">削除</h2>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
        >
          この蔵書を削除する
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-600">
            「{bookTitle}」を削除します。よろしいですか？
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
            >
              削除する
            </button>
            <button
              type="button"
              onClick={() => { setConfirming(false); setError(''); }}
              className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
