'use client';

import { useRouter } from 'next/navigation';
import { useTransition, useRef, useEffect } from 'react';

type Props = {
  defaultValue: string;
  currentFilter: string;
};

export function LoanHistorySearchForm({ defaultValue, currentFilter }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const prevPendingRef = useRef(false);

  // 検索完了後（isPending が true → false になったとき）に入力欄にフォーカスを戻す
  useEffect(() => {
    if (prevPendingRef.current && !isPending) {
      inputRef.current?.focus();
    }
    prevPendingRef.current = isPending;
  }, [isPending]);

  function buildParamsAndNavigate(form: HTMLFormElement) {
    const q = (form.elements.namedItem('q') as HTMLInputElement).value.trim();
    const params = new URLSearchParams();
    if (currentFilter && currentFilter !== 'all') params.set('filter', currentFilter);
    if (q) params.set('q', q);
    startTransition(() => {
      router.push(`/reception/loans${params.toString() ? `?${params.toString()}` : ''}`);
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    buildParamsAndNavigate(e.currentTarget);
  }

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:min-w-[200px]" aria-busy={isPending}>
      <input
        ref={inputRef}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="利用者名・メール・書籍タイトル・著者で検索"
        disabled={isPending}
        className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 disabled:opacity-70"
        aria-label="利用者名・メール・書籍タイトル・著者で検索"
        aria-describedby={isPending ? 'loans-search-status' : undefined}
      />
      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/70"
      >
        {isPending ? '検索中…' : '検索'}
      </button>
      {isPending && (
        <span id="loans-search-status" className="sr-only" aria-live="polite">
          検索中…
        </span>
      )}
    </form>
  );
}
