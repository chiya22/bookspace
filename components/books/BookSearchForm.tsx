'use client';

import { useRouter } from 'next/navigation';
import { useTransition, useRef, useEffect } from 'react';

type TagOption = { id: string; name: string };

type Props = {
  defaultValue: string;
  /** 検索結果を表示するパス。指定しない場合は /books */
  basePath?: string;
  /** タグで絞り込みする場合のタグ一覧（蔵書検索のみ）。指定しない場合はタグ選択を表示しない */
  allTags?: TagOption[];
  /** 現在選択中のタグID一覧（URL の tag パラメータ） */
  defaultTagIds?: string[];
  /** ログイン中の場合のみ true。お気に入りのみチェックを表示する */
  showFavoritesFilter?: boolean;
  /** お気に入りのみで絞り込むか（URL の fav=1） */
  defaultFavoritesOnly?: boolean;
};

export function BookSearchForm({
  defaultValue,
  basePath = '/books',
  allTags = [],
  defaultTagIds = [],
  showFavoritesFilter = false,
  defaultFavoritesOnly = false,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selectedSet = new Set(defaultTagIds);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function buildParamsAndNavigate(form: HTMLFormElement) {
    const q = (form.elements.namedItem('q') as HTMLInputElement).value.trim();
    const tagInputs = form.querySelectorAll<HTMLInputElement>('input[name="tag"]:checked');
    const tagIds = Array.from(tagInputs).map((el) => el.value.trim()).filter(Boolean);
    const favOnly = showFavoritesFilter && (form.elements.namedItem('fav') as HTMLInputElement | null)?.checked;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    tagIds.forEach((id) => params.append('tag', id));
    if (favOnly) params.set('fav', '1');
    startTransition(() => {
      router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ''}`);
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    buildParamsAndNavigate(e.currentTarget);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" aria-busy={isPending}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="タイトル・著者・出版社・ISBNで検索"
          autoFocus
          disabled={isPending}
          className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 disabled:opacity-70 sm:min-w-[200px]"
          aria-label="タイトル・著者・出版社・ISBNで検索"
          aria-describedby={isPending ? 'search-status' : undefined}
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
        >
          {isPending ? '検索中…' : '検索'}
        </button>
      </div>
      {isPending && (
        <span id="search-status" className="sr-only" aria-live="polite">
          検索中…
        </span>
      )}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-500">タグで絞り込み:</span>
          {allTags.map((tag) => (
            <label key={tag.id} className="inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="tag"
                value={tag.id}
                defaultChecked={selectedSet.has(tag.id)}
                className="peer sr-only"
              />
              <span
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5 text-[11px] text-zinc-700 shadow-sm transition
                  hover:border-emerald-500/40 hover:bg-white
                  peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-800"
              >
                {tag.name}
              </span>
            </label>
          ))}
        </div>
      )}
      {showFavoritesFilter && (
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-zinc-700">
          <input
            type="checkbox"
            name="fav"
            defaultChecked={defaultFavoritesOnly}
            className="h-3 w-3 rounded border-zinc-300"
          />
          <span>お気に入り登録している書籍のみ表示</span>
        </label>
      )}
    </form>
  );
}
