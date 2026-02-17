'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';
import { findOrCreateTagByName, setBookTags } from '@/lib/tags/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Database } from '@/types/database';

const COVER_BUCKET = 'book-covers';
const NDL_THUMBNAIL_BASE = 'https://iss.ndl.go.jp/thumbnail/';
const NDL_FETCH_TIMEOUT_MS = 8000;

type BookInsert = Database['public']['Tables']['books']['Insert'];

/**
 * 国会図書館の書影を取得して Storage にアップロードし、保存したパスを返す。失敗時は null。
 */
async function fetchAndSaveNdlCover(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  bookId: string,
  isbnNormalized: string
): Promise<string | null> {
  try {
    const res = await fetch(`${NDL_THUMBNAIL_BASE}${isbnNormalized}`, {
      signal: AbortSignal.timeout(NDL_FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'Bookspace/1.0' },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('Content-Type') ?? 'image/jpeg';
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length === 0) return null;
    const ext = contentType.includes('png') ? '.png' : '.jpg';
    const storagePath = `${bookId}${ext}`;
    const { error } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(storagePath, bytes, { upsert: true, contentType: contentType.split(';')[0]?.trim() || 'image/jpeg' });
    if (error) return null;
    return storagePath;
  } catch {
    return null;
  }
}

function assertAdmin() {
  // 呼び出し元で getSession() して role を確認したうえで呼ぶ想定。二重チェック用。
}

export type CreateBookState = { error?: string; success?: boolean };
export type UpdateBookState = { error?: string };
export type DeleteBookState = { error?: string };

export async function createBook(
  _prev: CreateBookState,
  formData: FormData
): Promise<CreateBookState> {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: '権限がありません。' };
  }
  assertAdmin();

  const title = formData.get('title')?.toString()?.trim();
  const author = formData.get('author')?.toString()?.trim();
  const publisher = formData.get('publisher')?.toString()?.trim();
  const isbn = formData.get('isbn')?.toString()?.trim();

  if (!title || !author || !publisher || !isbn) {
    return { error: 'タイトル・著者・出版社・ISBNは必須です。' };
  }

  const supabase = createSupabaseServerClient();
  const isbnNormalized = isbn.replace(/-/g, '');
  const payload: BookInsert = { title, author, publisher, isbn: isbnNormalized };
  const { data: inserted, error } = await supabase
    .from('books')
    .insert(payload as never)
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'このISBNは既に登録されています。' };
    return { error: '登録に失敗しました。' };
  }

  const bookId = (inserted as { id: string } | null)?.id;
  if (!bookId) return { error: '登録に失敗しました。' };
  const coverPath = await fetchAndSaveNdlCover(supabase, bookId, isbnNormalized);
  if (coverPath) {
    await supabase.from('books').update({ cover_image_path: coverPath } as never).eq('id', bookId);
  }

  revalidatePath('/books');
  revalidatePath('/admin/books');
  return { success: true };
}

function getExtension(filename: string): string {
  const m = filename.match(/\.([a-zA-Z0-9]+)$/);
  return m ? `.${m[1].toLowerCase()}` : '.jpg';
}

export async function updateBook(
  id: string,
  _prev: UpdateBookState,
  formData: FormData
): Promise<UpdateBookState> {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: '権限がありません。' };
  }

  const title = formData.get('title')?.toString()?.trim();
  const author = formData.get('author')?.toString()?.trim();
  const publisher = formData.get('publisher')?.toString()?.trim();
  const isbn = formData.get('isbn')?.toString()?.trim();

  if (!title || !author || !publisher || !isbn) {
    return { error: 'タイトル・著者・出版社・ISBNは必須です。' };
  }

  const supabase = createSupabaseServerClient();
  const isbnNormalized = isbn.replace(/-/g, '');

  let coverImagePath: string | null = null;
  const existing = await supabase.from('books').select('cover_image_path').eq('id', id).single();
  const currentPath = (existing.data as { cover_image_path: string | null } | null)?.cover_image_path ?? null;

  const coverFile = formData.get('cover');
  if (coverFile instanceof File && coverFile.size > 0) {
    const ext = getExtension(coverFile.name);
    const storagePath = `${id}${ext}`;
    // Next.js のサーバーアクション経由でも確実にアップロードできるよう、
    // File からバイト配列に変換して渡す
    const bytes = await coverFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(storagePath, new Uint8Array(bytes), {
        upsert: true,
        contentType: coverFile.type || 'image/jpeg',
      });
    if (uploadError) return { error: '表紙のアップロードに失敗しました。' };
    if (currentPath && currentPath !== storagePath) {
      await supabase.storage.from(COVER_BUCKET).remove([currentPath]);
    }
    coverImagePath = storagePath;
  }

  const updatePayload = {
    title,
    author,
    publisher,
    isbn: isbnNormalized,
    ...(coverImagePath !== null ? { cover_image_path: coverImagePath } : {}),
  };
  const { error } = await supabase.from('books').update(updatePayload as never).eq('id', id);

  if (error) return { error: '更新に失敗しました。' };

  const tagIds = (formData.getAll('tag_ids') ?? []) as string[];
  const newTagName = formData.get('new_tag')?.toString()?.trim();
  if (newTagName) {
    try {
      const newId = await findOrCreateTagByName(newTagName);
      if (!tagIds.includes(newId)) tagIds.push(newId);
    } catch {
      return { error: 'タグの追加に失敗しました。' };
    }
  }
  await setBookTags(id, tagIds);

  revalidatePath('/books');
  revalidatePath('/admin/books');
  revalidatePath(`/books/${id}`);
  revalidatePath(`/admin/books/${id}/edit`);
  redirect('/admin/books');
}

export async function deleteBook(id: string): Promise<DeleteBookState> {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: '権限がありません。' };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) return { error: '削除に失敗しました。' };
  revalidatePath('/books');
  revalidatePath('/admin/books');
  redirect('/admin/books');
}
