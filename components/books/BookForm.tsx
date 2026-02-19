'use client';

import { useRef, useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createBook, updateBook, type CreateBookState } from '@/lib/actions/books';
import { NdlLookup } from './NdlLookup';
import { CoverImage } from './CoverImage';

type TagRow = { id: string; name: string };

type BookFormProps = {
  mode: 'create';
  book?: null;
  currentCoverUrl?: null;
  allTags?: TagRow[] | null;
  bookTagIds?: string[] | null;
} | {
  mode: 'edit';
  book: { id: string; title: string; author: string; publisher: string; isbn: string; cover_image_path: string | null };
  currentCoverUrl: string | null;
  allTags: TagRow[];
  bookTagIds: string[];
};

export function BookForm({ mode, book, currentCoverUrl = null, allTags = [], bookTagIds = [] }: BookFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isbnInputRef = useRef<HTMLInputElement>(null);
  const registerButtonRef = useRef<HTMLButtonElement>(null);
  const ndlLookupRef = useRef<{ triggerLookup: () => Promise<void> }>(null);
  const didHandleSuccessRef = useRef(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [createState, createAction] = useActionState(createBook, {});
  const [updateState, updateAction] = useActionState(
    (prev: { error?: string }, fd: FormData) => updateBook(book!.id, prev, fd),
    {}
  );

  const state = mode === 'create' ? createState : updateState;
  const action = mode === 'create' ? createAction : updateAction;

  useEffect(() => {
    if (mode !== 'create') return;
    const createStateOnly = state as CreateBookState;
    if (createStateOnly?.success && !didHandleSuccessRef.current) {
      formRef.current?.reset();
      didHandleSuccessRef.current = true;
      // クリーンアップで clearTimeout しない。effect 再実行でタイマーがキャンセルされるとフォーカスが当たらないため。
      // revalidate 後の描画完了後にフォーカスする。ref が null の場合は DOM から取得する。
      window.setTimeout(() => {
        const input =
          isbnInputRef.current ?? document.querySelector<HTMLInputElement>('form input[name="isbn"]');
        input?.focus();
      }, 100);
    }
    if (state?.error) {
      didHandleSuccessRef.current = false;
    }
  }, [mode, (state as CreateBookState)?.success, state?.error]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex max-w-xl flex-col gap-4"
      onSubmit={() => {
        didHandleSuccessRef.current = false;
      }}
    >
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      )}
      <fieldset
        disabled={mode === 'create' && lookupLoading}
        className="flex flex-col gap-4 border-0 p-0 m-0 min-w-0 disabled:opacity-70 disabled:pointer-events-none"
      >
      <div className="flex items-center gap-2">
        <label className="w-24 shrink-0 text-xs font-medium text-zinc-700">ISBN</label>
        <input
          ref={isbnInputRef}
          type="text"
          name="isbn"
          defaultValue={book?.isbn}
          placeholder="978-4-..."
          autoFocus={mode === 'create'}
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
          onChange={
            mode === 'create'
              ? (e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  if (digits.length === 13) {
                    ndlLookupRef.current?.triggerLookup()?.then(() => {
                      registerButtonRef.current?.focus();
                    });
                  }
                }
              : undefined
          }
        />
        {mode === 'create' && <NdlLookup ref={ndlLookupRef} onLoadingChange={setLookupLoading} />}
      </div>
      <div className="flex gap-2">
        <label className="w-24 shrink-0 text-xs font-medium text-zinc-700">タイトル</label>
        <input
          type="text"
          name="title"
          defaultValue={book?.title}
          required
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
        />
      </div>
      <div className="flex gap-2">
        <label className="w-24 shrink-0 text-xs font-medium text-zinc-700">著者</label>
        <input
          type="text"
          name="author"
          defaultValue={book?.author}
          required
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
        />
      </div>
      <div className="flex gap-2">
        <label className="w-24 shrink-0 text-xs font-medium text-zinc-700">出版社</label>
        <input
          type="text"
          name="publisher"
          defaultValue={book?.publisher}
          required
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
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
            <label className="text-xs text-zinc-600">表紙を差し替える（アップロード）</label>
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
      {(mode === 'edit' || mode === 'create') && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-zinc-700">タグ</span>
          <div className="flex flex-wrap gap-2">
            {(allTags ?? []).map((tag) => {
              const checked = (bookTagIds ?? []).includes(tag.id);
              return (
                <label key={tag.id} className="inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="tag_ids"
                    value={tag.id}
                    defaultChecked={checked}
                    className="peer sr-only"
                  />
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] shadow-sm transition
                      ${
                        checked
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-zinc-200 bg-white/80 text-zinc-700'
                      }
                      peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-800`}
                  >
                    {tag.name}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-zinc-500">新しいタグを追加</label>
            <input
              type="text"
              name="new_tag"
              placeholder="例）デザイン / 経営 など"
              className="w-48 rounded-full border border-dashed border-zinc-300 px-3 py-1 text-[11px] text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-[10px] text-zinc-400">
              {mode === 'create' ? '入力して「登録」するとタグが追加されます' : '入力して「更新」するとタグが追加されます'}
            </span>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button
          ref={mode === 'create' ? registerButtonRef : undefined}
          type="submit"
          className="rounded-full bg-emerald-700 px-5 py-1.5 text-[13px] font-medium text-white shadow-sm transition hover:bg-emerald-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
        >
          {mode === 'create' ? '登録' : '更新'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-[13px] text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/70"
        >
          キャンセル
        </button>
      </div>
      </fieldset>
    </form>
  );
}
