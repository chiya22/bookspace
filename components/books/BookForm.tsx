'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createBook, updateBook } from '@/lib/actions/books';
import { NdlLookup } from './NdlLookup';
import { CoverImage } from './CoverImage';

type TagRow = { id: string; name: string };

type BookFormProps = {
  mode: 'create';
  book?: null;
  currentCoverUrl?: null;
  allTags?: null;
  bookTagIds?: null;
} | {
  mode: 'edit';
  book: { id: string; title: string; author: string; publisher: string; isbn: string; cover_image_path: string | null };
  currentCoverUrl: string | null;
  allTags: TagRow[];
  bookTagIds: string[];
};

export function BookForm({ mode, book, currentCoverUrl = null, allTags = [], bookTagIds = [] }: BookFormProps) {
  const router = useRouter();
  const [createState, createAction] = useActionState(createBook, {});
  const [updateState, updateAction] = useActionState(
    (prev: { error?: string }, fd: FormData) => updateBook(book!.id, prev, fd),
    {}
  );

  const state = mode === 'create' ? createState : updateState;
  const action = mode === 'create' ? createAction : updateAction;

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      )}
      <div className="flex items-center gap-2">
        <label className="w-24 shrink-0 text-sm font-medium text-zinc-700">ISBN</label>
        <input
          type="text"
          name="isbn"
          defaultValue={book?.isbn}
          placeholder="978-4-..."
          autoFocus={mode === 'create'}
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-zinc-900"
        />
        {mode === 'create' && <NdlLookup />}
      </div>
      <div className="flex gap-2">
        <label className="w-24 shrink-0 text-sm font-medium text-zinc-700">タイトル</label>
        <input
          type="text"
          name="title"
          defaultValue={book?.title}
          required
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </div>
      <div className="flex gap-2">
        <label className="w-24 shrink-0 text-sm font-medium text-zinc-700">著者</label>
        <input
          type="text"
          name="author"
          defaultValue={book?.author}
          required
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </div>
      <div className="flex gap-2">
        <label className="w-24 shrink-0 text-sm font-medium text-zinc-700">出版社</label>
        <input
          type="text"
          name="publisher"
          defaultValue={book?.publisher}
          required
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </div>
      {mode === 'edit' && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">表紙</span>
          <div className="flex flex-wrap items-start gap-4">
            <CoverImage
              src={currentCoverUrl}
              alt={book.title}
              className="h-40 w-28 shrink-0 overflow-hidden rounded border border-zinc-200 bg-zinc-100 object-cover"
              width={112}
              height={160}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm text-zinc-600">表紙を差し替える（アップロード）</label>
              <input
                type="file"
                name="cover"
                accept="image/*"
                className="block text-sm text-zinc-600 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
              />
              <p className="text-xs text-zinc-500">画像を選択すると、保存時に表紙が差し替わります。</p>
            </div>
          </div>
        </div>
      )}
      {mode === 'create' && (
        <p className="text-sm text-zinc-500">表紙は国会図書館の書影を自動で表示します。登録後、編集画面でアップロード画像に差し替えできます。</p>
      )}
      {mode === 'edit' && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">タグ</span>
          <div className="flex flex-wrap gap-3">
            {allTags.map((tag) => (
              <label key={tag.id} className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="tag_ids"
                  value={tag.id}
                  defaultChecked={bookTagIds.includes(tag.id)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <span className="text-sm text-zinc-800">{tag.name}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">新しいタグを追加</label>
            <input
              type="text"
              name="new_tag"
              placeholder="タグ名を入力して保存"
              className="w-full max-w-xs rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900"
            />
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {mode === 'create' ? '登録' : '更新'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
