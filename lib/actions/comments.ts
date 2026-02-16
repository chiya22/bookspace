'use server';

import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const BODY_MAX_LENGTH = 2000;

export type CreateCommentState = { error?: string };

export async function createComment(
  _prev: CreateCommentState,
  formData: FormData
): Promise<CreateCommentState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: 'コメントするにはログインしてください。' };
  }

  const bookId = formData.get('book_id')?.toString()?.trim();
  const body = formData.get('body')?.toString()?.trim();

  if (!bookId || body === undefined) return { error: '書籍が指定されていません。' };
  if (body === '') return { error: 'コメントを入力してください。' };
  if (body.length > BODY_MAX_LENGTH) return { error: `コメントは${BODY_MAX_LENGTH}文字以内で入力してください。` };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('book_comments').insert({
    book_id: bookId,
    user_id: session.user.id,
    body,
  } as never);

  if (error) {
    if (error.code === '23503') return { error: '書籍または利用者が存在しません。' };
    return { error: 'コメントの登録に失敗しました。' };
  }

  revalidatePath(`/books/${bookId}`);
  return {};
}
