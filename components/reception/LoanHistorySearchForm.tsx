'use client';

import { useRouter } from 'next/navigation';
import { useTransition, useRef, useEffect } from 'react';

const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  defaultValue: string;
  currentFilter: string;
};

export function LoanHistorySearchForm({ defaultValue, currentFilter }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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

  function onSearchInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const form = e.currentTarget.form;
    if (!form) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      buildParamsAndNavigate(form);
    }, SEARCH_DEBOUNCE_MS);
  }

  return (
    <form onSubmit={onSubmit} className="min-w-0 flex-1 sm:min-w-[200px]">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="利用者名・メール・書籍タイトル・著者で検索"
        onChange={onSearchInputChange}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        aria-label="利用者名・メール・書籍タイトル・著者で検索"
      />
    </form>
  );
}
