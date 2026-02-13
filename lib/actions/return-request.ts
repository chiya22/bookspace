'use server';

import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmailAndLog } from '@/lib/mail/send';
import { revalidatePath } from 'next/cache';

export type ReturnRequestState = { error?: string; success?: string };

function loanDays(lentAt: string, returnedAt: string | null): number {
  const end = returnedAt ? new Date(returnedAt).getTime() : Date.now();
  return Math.floor((end - new Date(lentAt).getTime()) / (24 * 60 * 60 * 1000));
}

export async function sendReturnRequestEmail(
  _prev: ReturnRequestState,
  formData: FormData
): Promise<ReturnRequestState> {
  const session = await getSession();
  const loanId = formData.get('loanId')?.toString();
  if (!loanId) return { error: '貸出履歴が指定されていません。' };
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: '権限がありません。' };
  }

  const supabase = createSupabaseServerClient();
  const { data: loanRow } = await supabase
    .from('loans')
    .select(
      `
      id,
      lent_at,
      returned_at,
      books ( id, title, author ),
      users ( id, name, email )
    `
    )
    .eq('id', loanId)
    .maybeSingle();

  if (!loanRow) return { error: '貸出履歴が見つかりません。' };

  type LoanRow = {
    lent_at: string;
    returned_at: string | null;
    books: { id: string; title: string; author: string } | null;
    users: { id: string; name: string; email: string } | null;
  };
  const loan = loanRow as LoanRow;
  const user = loan.users;
  const book = loan.books;

  if (!user?.email) return { error: '利用者情報が見つかりません。' };
  if (loan.returned_at) return { error: 'この貸出はすでに返却済みです。' };

  const lentAtStr = loan.lent_at
    ? new Date(loan.lent_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';
  const days = loanDays(loan.lent_at, loan.returned_at);
  const bookTitle = book?.title ?? '（書籍名不明）';
  const bookAuthor = book?.author ?? '';

  const bodyLines = [
    `${user.name} 様`,
    '',
    'お借りいただいている下記の図書の返却をお願いいたします。',
    '',
    '【借りている書籍】',
    `　タイトル：${bookTitle}`,
    bookAuthor ? `　著者：${bookAuthor}` : null,
    `　貸出日：${lentAtStr}`,
    `　貸出日数：${days}日`,
    '',
    'ご協力のほどよろしくお願いいたします。',
  ].filter(Boolean);

  const result = await sendEmailAndLog({
    to: user.email,
    subject: '【ちよプラブックスペース】返却のご依頼',
    text: bodyLines.join('\n'),
    kind: 'return_request',
    recipientUserId: user.id,
  });

  if (!result.ok) return { error: `メール送信に失敗しました: ${result.error}` };
  revalidatePath('/reception/loans');
  return { success: '返却依頼メールを送信しました。' };
}
