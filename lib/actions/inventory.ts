'use server';

import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function normalizeIsbn(isbn: string): string {
  return isbn.replace(/-/g, '').trim();
}

export type InventoryActionState = { error?: string; success?: string };

/**
 * 在庫チェック履歴をすべてクリアする。
 */
export async function clearInventoryChecks(): Promise<InventoryActionState> {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: '権限がありません。' };
  }
  const supabase = createSupabaseServerClient();
  await supabase.from('inventory_checks').delete().neq('book_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('inventory_clear_history').insert({ cleared_at: new Date().toISOString() } as never);
  revalidatePath('/admin/inventory');
  return { success: '在庫チェック履歴をクリアしました。' };
}

/**
 * ISBN で書籍を特定し、在庫チェック済みとして記録する。
 */
export async function checkBookByIsbn(
  _prev: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: '権限がありません。' };
  }
  const isbnRaw = formData.get('isbn')?.toString()?.trim();
  if (!isbnRaw) return { error: 'ISBNを入力してください。' };
  const isbnNorm = normalizeIsbn(isbnRaw);

  const supabase = createSupabaseServerClient();
  const { data: books } = await supabase.from('books').select('id, isbn');
  const book = (books ?? []).find(
    (b) => normalizeIsbn((b as { isbn: string }).isbn ?? '') === isbnNorm
  ) as { id: string } | undefined;
  if (!book) return { error: `該当する書籍が見つかりません。（ISBN: ${isbnRaw}）` };

  await supabase
    .from('inventory_checks')
    .upsert({ book_id: book.id, checked_at: new Date().toISOString() } as never, { onConflict: 'book_id' });
  revalidatePath('/admin/inventory');
  return { success: '在庫チェックを記録しました。' };
}
