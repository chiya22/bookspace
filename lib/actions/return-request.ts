'use server';

import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmailAndLog } from '@/lib/mail/send';
import { revalidatePath } from 'next/cache';

export type ReturnRequestState = { error?: string; success?: string };

export async function sendReturnRequestEmail(
  _prev: ReturnRequestState,
  formData: FormData
): Promise<ReturnRequestState> {
  const session = await getSession();
  const userId = formData.get('userId')?.toString();
  if (!userId) return { error: '利用者が指定されていません。' };
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: '権限がありません。' };
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('id', userId)
    .maybeSingle();
  if (!data) return { error: '利用者が見つかりません。' };
  const user = data as { id: string; email: string; name: string };

  const result = await sendEmailAndLog({
    to: user.email,
    subject: '【ちよプラブックスペース】返却のご依頼',
    text: `${user.name} 様\n\nお借りいただいている図書の返却をお願いいたします。\n\nご協力のほどよろしくお願いいたします。`,
    kind: 'return_request',
    recipientUserId: user.id,
  });

  if (!result.ok) return { error: `メール送信に失敗しました: ${result.error}` };
  revalidatePath('/admin/users');
  return { success: '返却依頼メールを送信しました。' };
}
