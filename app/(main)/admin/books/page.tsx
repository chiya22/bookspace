import { Suspense } from 'react';
import { searchBooks } from '@/lib/books/queries';
import { getCoverSignedUrl, getNdlThumbnailUrl } from '@/lib/books/cover';
import { getAllTags, getTagsByBookIds } from '@/lib/tags/queries';
import { getPageSize, parsePage, sliceForPage } from '@/lib/pagination';
import { PaginationNav } from '@/components/PaginationNav';
import Link from 'next/link';
import { CoverImage } from '@/components/books/CoverImage';
import { BookSearchForm } from '@/components/books/BookSearchForm';

export const metadata = {
  title: '蔵書管理 | ちよプラブックスペース',
};

type Props = {
  searchParams: Promise<{ q?: string; tag?: string | string[]; page?: string }>;
};

function normalizeTagIds(tag: string | string[] | undefined): string[] {
  if (tag == null) return [];
  return Array.isArray(tag) ? tag.filter((t) => typeof t === 'string' && t.trim()) : [tag.trim()].filter(Boolean);
}

export default async function AdminBooksPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const keyword = typeof resolved.q === 'string' ? resolved.q : '';
  const tagIds = normalizeTagIds(resolved.tag);
  const pageSize = getPageSize();
  const page = parsePage(resolved);

  const [books, allTags] = await Promise.all([
    searchBooks(keyword, tagIds.length > 0 ? tagIds : null),
    getAllTags(),
  ]);

  const totalCount = books.length;
  const pagedBooks = sliceForPage(books, page, pageSize);
  const tagsByBookId = await getTagsByBookIds(pagedBooks.map((b) => b.id));

  const withCovers = await Promise.all(
    pagedBooks.map(async (b) => {
      const uploaded = await getCoverSignedUrl(b.cover_image_path);
      return {
        ...b,
        coverUrl: uploaded ?? (getNdlThumbnailUrl(b.isbn) || null),
        tags: tagsByBookId.get(b.id) ?? [],
      };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/books/new"
          className="shrink-0 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          新規登録
        </Link>
      </div>
      <Suspense fallback={<div className="h-10 rounded border border-zinc-200 bg-zinc-50" />}>
        <BookSearchForm
          defaultValue={keyword}
          basePath="/admin/books"
          allTags={allTags}
          defaultTagIds={tagIds}
        />
      </Suspense>
      {withCovers.length === 0 ? (
        <p className="text-sm text-zinc-600">
          {(keyword || tagIds.length > 0) ? '該当する蔵書がありません。' : '蔵書がまだありません。新規登録から追加してください。'}
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
          {withCovers.map((book) => (
            <li
              key={book.id}
              className="flex items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-emerald-50/40"
            >
              <div className="h-12 w-8 shrink-0 overflow-hidden rounded bg-zinc-100">
                <CoverImage
                  src={book.coverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  width={32}
                  height={48}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[13px] font-semibold text-zinc-900">{book.title}</span>
                    <span className="ml-2 text-[11px] text-zinc-600">
                      {book.author}／{book.publisher}
                    </span>
                    {book.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {book.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full border border-zinc-200 bg-white/70 px-1.5 py-0.5 text-[11px] text-zinc-600"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 hover:border-emerald-500/60 hover:text-emerald-800"
                    >
                      編集
                    </Link>
                    <Link
                      href={`/books/${book.id}?from=admin`}
                      className="inline-flex items-center rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 hover:border-zinc-400 hover:text-zinc-900"
                    >
                      詳細
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {totalCount > 0 && (
        <PaginationNav
          totalCount={totalCount}
          pageSize={pageSize}
          currentPage={page}
          basePath="/admin/books"
          searchParams={{
            ...(keyword && { q: keyword }),
            ...(tagIds.length > 0 && { tag: tagIds }),
          }}
        />
      )}
      <p className="mt-2 text-sm">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] text-zinc-700 shadow-sm transition hover:border-emerald-500/50 hover:text-emerald-800 hover:shadow-md"
        >
          <span className="text-xs">←</span>
          <span>管理メニューへ戻る</span>
        </Link>
      </p>
    </div>
  );
}
