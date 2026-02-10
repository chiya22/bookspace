'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

type Props = {
  defaultValue: string;
  currentFilter: string;
};

export function LoanHistorySearchForm({ defaultValue, currentFilter }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem('q') as HTMLInputElement).value.trim();
    const params = new URLSearchParams();
    if (currentFilter && currentFilter !== 'all') params.set('filter', currentFilter);
    if (q) params.set('q', q);
    startTransition(() => {
      router.push(`/reception/loans${params.toString() ? `?${params.toString()}` : ''}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="利用者名・メール・書籍タイトル・著者で検索"
        className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {isPending ? '検索中...' : '検索'}
      </button>
    </form>
  );
}
