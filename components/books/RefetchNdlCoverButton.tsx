'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { refetchNdlCover } from '@/lib/actions/books';

type Props = {
  bookId: string;
};

export function RefetchNdlCoverButton({ bookId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    const result = await refetchNdlCover(bookId);
    setLoading(false);
    if (result.success) {
      router.refresh();
      return;
    }
    if (result.notFound) {
      setMessage({ type: 'info', text: '国会図書館に書影が見つかりませんでした。' });
      return;
    }
    setMessage({ type: 'error', text: result.error ?? '取得に失敗しました。' });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-[11px] text-zinc-700 transition hover:border-emerald-500/60 hover:text-emerald-800 disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
            取得中…
          </>
        ) : (
          <>
            <span aria-hidden>🔄</span>
            国会図書館から画像を再取得
          </>
        )}
      </button>
      {message && (
        <p
          className={`text-[11px] ${message.type === 'error' ? 'text-red-600' : 'text-zinc-500'}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
