'use server';

import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { messages } from '@/lib/messages';
import { revalidatePath } from 'next/cache';

/**
 * お気に入りに追加する。ログイン中の利用者のみ。
 */
export async function addFavorite(bookId: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: messages.loginRequired };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: session.user.id, book_id: bookId } as never);

  if (error) {
    if (error.code === '23505') return {}; // 既に登録済み
    return { error: messages.failedToAdd };
  }

  revalidatePath('/books');
  revalidatePath(`/books/${bookId}`);
  return {};
}

/**
 * お気に入りを解除する。ログイン中の利用者のみ。
 */
export async function removeFavorite(bookId: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: messages.loginRequired };
  }

  const supabase = createSupabaseServerClient();
  await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', session.user.id)
    .eq('book_id', bookId);

  revalidatePath('/books');
  revalidatePath(`/books/${bookId}`);
  return {};
}

/**
 * お気に入りのトグル。登録されていれば解除、されていなければ追加。
 */
export async function toggleFavorite(bookId: string, currentlyFavorited: boolean): Promise<{ error?: string }> {
  return currentlyFavorited ? removeFavorite(bookId) : addFavorite(bookId);
}
