'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

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

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
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

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="タイトル・著者・出版社・ISBNで検索"
          autoFocus
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-zinc-900"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {isPending ? '検索中...' : '検索'}
        </button>
      </div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-zinc-600">タグで絞り込み（複数選択可）:</span>
          {allTags.map((tag) => (
            <label key={tag.id} className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                name="tag"
                value={tag.id}
                defaultChecked={selectedSet.has(tag.id)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className="text-sm text-zinc-800">{tag.name}</span>
            </label>
          ))}
        </div>
      )}
      {showFavoritesFilter && (
        <label className="inline-flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            name="fav"
            defaultChecked={defaultFavoritesOnly}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-800">お気に入り登録している書籍のみ表示</span>
        </label>
      )}
    </form>
  );
}
