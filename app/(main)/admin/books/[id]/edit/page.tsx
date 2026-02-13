import { getBookById } from '@/lib/books/queries';
import { getCoverSignedUrl, getNdlThumbnailUrl } from '@/lib/books/cover';
import { getAllTags, getTagIdsByBookId } from '@/lib/tags/queries';
import { notFound } from 'next/navigation';
import { BookForm } from '@/components/books/BookForm';
import { DeleteBookButton } from '@/components/books/DeleteBookButton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) return { title: '編集' };
  return { title: `${book.title} の編集 | 蔵書管理` };
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminBooksEditPage({ params }: Props) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  const [uploadedCoverUrl, allTags, bookTagIds] = await Promise.all([
    getCoverSignedUrl(book.cover_image_path),
    getAllTags(),
    getTagIdsByBookId(id),
  ]);
  const coverDisplayUrl = uploadedCoverUrl ?? (book.isbn ? getNdlThumbnailUrl(book.isbn) : null);

  return (
    <div className="flex flex-col gap-6">
      <BookForm
        mode="edit"
        book={book}
        currentCoverUrl={coverDisplayUrl}
        allTags={allTags}
        bookTagIds={bookTagIds}
      />
      <div className="border-t border-zinc-200 pt-6">
        <DeleteBookButton bookId={id} bookTitle={book.title} />
      </div>
    </div>
  );
}
