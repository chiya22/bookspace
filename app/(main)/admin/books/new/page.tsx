import { BookForm } from '@/components/books/BookForm';
import { getAllTags } from '@/lib/tags/queries';

export const metadata = {
  title: '蔵書登録 | ちよプラブックスペース',
};

export default async function AdminBooksNewPage() {
  const allTags = await getAllTags();
  return (
    <div className="flex flex-col gap-6">
      <BookForm mode="create" allTags={allTags} bookTagIds={[]} />
    </div>
  );
}
