'use server';

import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export type UpdateDisplayNameState = { error?: string; success?: string };
export type ChangePasswordState = { error?: string };

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
    .update({ display_name: displayName || null } as never)
    .eq('id', session.user.id);

  if (error) return { error: '更新に失敗しました。' };

  revalidatePath('/account');
  revalidatePath('/', 'layout');
  return { success: '表示名を更新しました。' };
}

/**
 * 自分のパスワードを変更する。成功時はログアウトし、再ログインが必要になる。
 */
export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: 'ログインしてください。' };
  }

  const currentPassword = formData.get('current_password')?.toString() ?? '';
  const newPassword = formData.get('new_password')?.toString() ?? '';
  const newPasswordConfirm = formData.get('new_password_confirm')?.toString() ?? '';

  if (!currentPassword) return { error: '現在のパスワードを入力してください。' };
  if (!newPassword || newPassword.length < 8) return { error: '新しいパスワードは8文字以上で入力してください。' };
  if (newPassword !== newPasswordConfirm) return { error: '新しいパスワードと確認用が一致しません。' };

  const supabase = createSupabaseServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', session.user.id)
    .single();

  const passwordHash = (user as { password_hash: string } | null)?.password_hash;
  if (!passwordHash) return { error: 'ユーザー情報の取得に失敗しました。' };

  const ok = await bcrypt.compare(currentPassword, passwordHash);
  if (!ok) return { error: '現在のパスワードが正しくありません。' };

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash: newHash } as never)
    .eq('id', session.user.id);

  if (updateError) return { error: 'パスワードの更新に失敗しました。' };

  revalidatePath('/account');
  redirect('/account/password-changed');
}
