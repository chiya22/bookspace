import { Suspense } from 'react';
import { searchBooks } from '@/lib/books/queries';
import { getNdlThumbnailUrl } from '@/lib/books/cover';
import { getAllTags, getTagsByBookIds } from '@/lib/tags/queries';
import { getSession } from '@/lib/auth';
import { getFavoriteBookIds } from '@/lib/favorites/queries';
import { getCommentCountsByBookIds } from '@/lib/comments/queries';
import Link from 'next/link';
import { BookSearchForm } from '@/components/books/BookSearchForm';
import { CoverImage } from '@/components/books/CoverImage';
import { FavoriteStarButton } from '@/components/books/FavoriteStarButton';

export const metadata = {
  title: '蔵書検索 | ちよプラブックスペース',
  description: '蔵書の検索・一覧',
};

type Props = {
  searchParams: Promise<{ q?: string; tag?: string | string[]; fav?: string }>;
};

function normalizeTagIds(tag: string | string[] | undefined): string[] {
  if (tag == null) return [];
  return Array.isArray(tag) ? tag.filter((t) => typeof t === 'string' && t.trim()) : [tag.trim()].filter(Boolean);
}

export default async function BooksPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const keyword = typeof resolved.q === 'string' ? resolved.q : '';
  const tagIds = normalizeTagIds(resolved.tag);
  const favoritesOnly = resolved.fav === '1';

  const [books, allTags, session] = await Promise.all([
    searchBooks(keyword, tagIds.length > 0 ? tagIds : null),
    getAllTags(),
    getSession(),
  ]);

  const userId = session?.user?.id;
  const favoriteBookIds = userId ? await getFavoriteBookIds(userId) : new Set<string>();
  let filteredBooks = books;
  if (favoritesOnly && userId) {
    filteredBooks = books.filter((b) => favoriteBookIds.has(b.id));
  }

  const [tagsByBookId, commentCountsByBookId] = await Promise.all([
    getTagsByBookIds(filteredBooks.map((b) => b.id)),
    getCommentCountsByBookIds(filteredBooks.map((b) => b.id)),
  ]);

  const booksWithCovers = filteredBooks.map((book) => ({
    ...book,
    coverUrl: getNdlThumbnailUrl(book.isbn) || null,
    tags: tagsByBookId.get(book.id) ?? [],
    commentCount: commentCountsByBookId.get(book.id) ?? 0,
  }));

  const showFavoritesFilter = !!userId;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">蔵書検索</h1>
      <Suspense fallback={<div className="h-10 rounded border border-zinc-200 bg-zinc-50" />}>
        <BookSearchForm
          defaultValue={keyword}
          allTags={allTags}
          defaultTagIds={tagIds}
          showFavoritesFilter={showFavoritesFilter}
          defaultFavoritesOnly={favoritesOnly}
        />
      </Suspense>
      {booksWithCovers.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          {(keyword || tagIds.length > 0 || favoritesOnly)
            ? '該当する蔵書がありません。'
            : '蔵書がまだ登録されていません。'}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {booksWithCovers.map((book) => (
            <li key={book.id}>
              <div className="relative">
                {userId && (
                  <div className="absolute right-2 top-2 z-10">
                    <FavoriteStarButton bookId={book.id} isFavorited={favoriteBookIds.has(book.id)} />
                  </div>
                )}
                <Link
                  href={`/books/${book.id}`}
                  className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-3 transition hover:border-zinc-300"
                >
                  <div className="h-24 w-16 shrink-0 overflow-hidden rounded bg-zinc-100">
                    <CoverImage
                      src={book.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      width={64}
                      height={96}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="break-words font-medium text-zinc-900">{book.title}</div>
                    <div className="truncate text-sm text-zinc-600">{book.author}</div>
                    <div className="truncate text-sm text-zinc-500">{book.publisher}</div>
                    {book.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {book.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5 shrink-0"
                        aria-hidden
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>{book.commentCount}件</span>
                    </div>
                  </div>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
