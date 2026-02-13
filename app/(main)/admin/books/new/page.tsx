import { BookForm } from '@/components/books/BookForm';

export const metadata = {
  title: '蔵書登録 | ちよプラブックスペース',
};

export default function AdminBooksNewPage() {
  return (
    <div className="flex flex-col gap-6">
      <BookForm mode="create" />
    </div>
  );
}
