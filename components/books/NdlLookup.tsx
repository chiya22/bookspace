'use client';

import { useState, useCallback, forwardRef, useImperativeHandle } from 'react';

export const NdlLookup = forwardRef<{ triggerLookup: () => Promise<void> }>(function NdlLookup(_, ref) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = useCallback(async () => {
    const isbnInput = document.querySelector<HTMLInputElement>('input[name="isbn"]');
    const titleInput = document.querySelector<HTMLInputElement>('input[name="title"]');
    const authorInput = document.querySelector<HTMLInputElement>('input[name="author"]');
    const publisherInput = document.querySelector<HTMLInputElement>('input[name="publisher"]');
    if (!isbnInput?.value.trim()) {
      setError('ISBNを入力してください。');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/ndl/lookup?isbn=${encodeURIComponent(isbnInput.value.trim())}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error === 'not_found' ? '書誌が見つかりませんでした。' : '取得に失敗しました。');
        return;
      }
      if (titleInput) titleInput.value = data.title ?? '';
      if (authorInput) authorInput.value = data.author ?? '';
      if (publisherInput) publisherInput.value = data.publisher ?? '';
    } catch {
      setError('取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({ triggerLookup: handleLookup }), [handleLookup]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleLookup}
        disabled={loading}
        className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
      >
        {loading ? '取得中...' : '書誌を取得'}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
});
