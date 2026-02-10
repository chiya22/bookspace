import Link from 'next/link';
import { getBookById } from '@/lib/books/queries';
import { getCoverSignedUrl, getNdlThumbnailUrl } from '@/lib/books/cover';
import { getTagsByBookId } from '@/lib/tags/queries';
import { getCommentsByBookId } from '@/lib/comments/queries';
import { getSession } from '@/lib/auth';
import { isBookFavorited } from '@/lib/favorites/queries';
import { notFound } from 'next/navigation';
import { CoverImage } from '@/components/books/CoverImage';
import { FavoriteStarButton } from '@/components/books/FavoriteStarButton';
import { BookCommentForm } from './BookCommentForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) return { title: '書籍が見つかりません' };
  return {
    title: `${book.title} | 蔵書詳細 | ちよプラブックスペース`,
    description: `${book.author}／${book.publisher}`,
  };
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function BookDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { from } = await searchParams;
  const fromAdmin = from === 'admin';

  const [book, session] = await Promise.all([
    getBookById(id),
    getSession(),
  ]);
  if (!book) notFound();

  const [uploadedCoverUrl, tags, favorited, comments] = await Promise.all([
    getCoverSignedUrl(book.cover_image_path),
    getTagsByBookId(id),
    fromAdmin ? Promise.resolve(false) : (session?.user?.id ? isBookFavorited(session.user.id, id) : Promise.resolve(false)),
    getCommentsByBookId(id),
  ]);
  const coverUrl = uploadedCoverUrl ?? (getNdlThumbnailUrl(book.isbn) || null);
  const isStaff = session?.user?.role === 'librarian' || session?.user?.role === 'admin';
  const userId = session?.user?.id;
  const showFavorites = !fromAdmin && userId != null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/books" className="text-zinc-600 underline hover:text-zinc-900">
          蔵書検索へ戻る
        </Link>
        {isStaff && (
          <>
            <span className="text-zinc-400">|</span>
            <Link href="/admin/books" className="text-zinc-600 underline hover:text-zinc-900">
              蔵書管理へ戻る
            </Link>
          </>
        )}
      </div>
      <div className="flex gap-6 rounded-lg border border-zinc-200 bg-white p-6">
        <div className="h-48 w-32 shrink-0 overflow-hidden rounded bg-zinc-100">
          <CoverImage
            src={coverUrl}
            alt={`${book.title}の表紙`}
            className="h-full w-full object-cover"
            width={128}
            height={192}
          />
        </div>
        <dl className="grid flex-1 gap-2 text-sm">
          <div>
            <dt className="font-medium text-zinc-500">タイトル</dt>
            <dd className="text-zinc-900">{book.title}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">著者</dt>
            <dd className="text-zinc-900">{book.author}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">出版社</dt>
            <dd className="text-zinc-900">{book.publisher}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">ISBN</dt>
            <dd className="text-zinc-900">{book.isbn}</dd>
          </div>
          {tags.length > 0 && (
            <div>
              <dt className="font-medium text-zinc-500">タグ</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
                  >
                    {tag.name}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {showFavorites && (
            <div>
              <dt className="font-medium text-zinc-500">お気に入り</dt>
              <dd className="mt-1 flex items-center gap-2">
                <FavoriteStarButton bookId={id} isFavorited={favorited} />
                <span className="text-sm text-zinc-600">
                  {favorited ? 'お気に入りに登録済み' : 'お気に入りに追加'}
                </span>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-medium text-zinc-700">コメント</h2>
        {comments.length === 0 ? (
          <p className="text-sm text-zinc-500">まだコメントはありません。</p>
        ) : (
          <ul className="mb-6 flex flex-col gap-4">
            {comments.map((c) => (
              <li key={c.id} className="border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                <div className="mb-1 flex flex-wrap items-baseline gap-2 text-sm">
                  <span className="font-medium text-zinc-900">{c.commenter_display_name}</span>
                  <span className="text-zinc-500">
                    {new Date(c.created_at).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-zinc-700">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
        {session?.user && !fromAdmin && (
          <>
            <h3 className="mb-2 text-sm font-medium text-zinc-700">コメントを投稿</h3>
            <BookCommentForm bookId={id} />
          </>
        )}
      </section>
    </div>
  );
}
