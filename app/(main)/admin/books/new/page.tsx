import { BookForm } from '@/components/books/BookForm';

export const metadata = {
  title: '蔵書登録 | ちよプラブックスペース',
};

export default function AdminBooksNewPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">蔵書登録</h1>
      <BookForm mode="create" />
    </div>
  );
}
