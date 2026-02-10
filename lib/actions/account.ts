'use server';

import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type UpdateDisplayNameState = { error?: string; success?: string };

export async function updateDisplayName(
  _prev: UpdateDisplayNameState,
  formData: FormData
): Promise<UpdateDisplayNameState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: 'ログインしてください。' };
  }

  const displayName = formData.get('display_name')?.toString()?.trim() ?? '';

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('users')
    .update({ display_name: displayName || null })
    .eq('id', session.user.id);

  if (error) return { error: '更新に失敗しました。' };

  revalidatePath('/account');
  revalidatePath('/', 'layout');
  return { success: '表示名を更新しました。' };
}
