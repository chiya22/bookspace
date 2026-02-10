'use server';

import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/types/database';

export type UpdateUserState = { error?: string };

export async function updateUser(
  _prev: UpdateUserState,
  formData: FormData
): Promise<UpdateUserState> {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: '権限がありません。' };
  }

  const userId = formData.get('userId')?.toString();
  if (!userId) return { error: '利用者が指定されていません。' };

  const name = formData.get('name')?.toString()?.trim();
  const email = formData.get('email')?.toString()?.trim();
  const role = formData.get('role')?.toString()?.trim();
  const disabled = formData.get('disabled') === 'on';

  if (!name || !email) return { error: '名前とメールは必須です。' };
  const validRoles: UserRole[] = ['user', 'librarian', 'admin'];
  const newRole = validRoles.includes(role as UserRole) ? (role as UserRole) : 'user';

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('users')
    .update({ name, email, role: newRole, disabled } as never)
    .eq('id', userId);

  if (error) {
    if (error.code === '23505') return { error: 'このメールアドレスは既に使用されています。' };
    return { error: '更新に失敗しました。' };
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}/edit`);
  redirect('/admin/users');
}
