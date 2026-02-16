'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';
import { getBookByIsbn } from '@/lib/books/queries';
import { parseQrCodeData } from '@/lib/qr/generate';
import { sendEmailAndLog } from '@/lib/mail/send';
import { revalidatePath } from 'next/cache';

export type LoanState = { error?: string; success?: string };
export type ReturnState = { error?: string; success?: string };

function getUserIdFromInput(qrDataOrUserId: string): string | null {
  const parsed = parseQrCodeData(qrDataOrUserId);
  if (parsed) return parsed.userId;
  const trimmed = qrDataOrUserId.trim();
  if (trimmed.length > 0) return trimmed;
  return null;
}

export async function registerLoan(
  _prev: LoanState,
  formData: FormData
): Promise<LoanState> {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: '権限がありません。' };
  }

  const isbn = formData.get('isbn')?.toString()?.trim();
  const qrInput = formData.get('qr_data')?.toString()?.trim();
  if (!isbn) return { error: 'ISBNを入力してください。' };
  const userId = getUserIdFromInput(qrInput ?? '');
  if (!userId) return { error: '会員証QRコードをスキャンするか、利用者IDを入力してください。' };

  const book = await getBookByIsbn(isbn);
  if (!book) return { error: '該当する蔵書が見つかりません。' };

  const supabase = createSupabaseServerClient();
  type UserRow = { id: string; email: string; name: string };
  const { data: userRow } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('id', userId)
    .maybeSingle();
  const user = userRow as UserRow | null;
  if (!user) return { error: '利用者が見つかりません。' };

  const { data: bookOnLoan } = await supabase
    .from('loans')
    .select('id')
    .eq('book_id', book.id)
    .is('returned_at', null)
    .limit(1)
    .maybeSingle();
  if (bookOnLoan) return { error: 'この書籍は現在貸出中です。' };

  const { data: existingLoan } = await supabase
    .from('loans')
    .select('id')
    .eq('user_id', userId)
    .is('returned_at', null)
    .limit(1)
    .maybeSingle();
  if (existingLoan) return { error: 'この利用者は既に1冊貸出中です。' };

  const { error } = await supabase.from('loans').insert({
    user_id: userId,
    book_id: book.id,
  } as never);

  if (error) return { error: '貸出登録に失敗しました。' };

  const loanBookLines = [
    `${user.name} 様`,
    '',
    '以下の書籍の貸出が完了しました。',
    '',
    '【対象書籍】',
    `　タイトル：${book.title}`,
    `　著者：${book.author}`,
    `　出版社：${book.publisher}`,
    `　ISBN：${book.isbn}`,
    '',
    'ご利用ありがとうございます。',
  ];
  await sendEmailAndLog({
    to: user.email,
    subject: '【ちよプラブックスペース】貸出完了のご案内',
    text: loanBookLines.join('\n'),
    kind: 'loan',
    recipientUserId: userId,
  });

  revalidatePath('/');
  revalidatePath('/reception/loan');
  return { success: '貸出を登録しました。' };
}

export async function registerReturn(
  _prev: ReturnState,
  formData: FormData
): Promise<ReturnState> {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: '権限がありません。' };
  }

  const isbn = formData.get('isbn')?.toString()?.trim();
  const qrInput = formData.get('qr_data')?.toString()?.trim();
  if (!isbn) return { error: 'ISBNを入力してください。' };
  const userId = getUserIdFromInput(qrInput ?? '');
  if (!userId) return { error: '会員証QRコードをスキャンするか、利用者IDを入力してください。' };

  const book = await getBookByIsbn(isbn);
  if (!book) return { error: '該当する蔵書が見つかりません。' };

  const supabase = createSupabaseServerClient();
  type UserRow = { id: string; email: string; name: string };
  const { data: userRow } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('id', userId)
    .maybeSingle();
  const user = userRow as UserRow | null;
  if (!user) return { error: '利用者が見つかりません。' };

  const { data: loan } = await supabase
    .from('loans')
    .select('id')
    .eq('user_id', userId)
    .eq('book_id', book.id)
    .is('returned_at', null)
    .single();
  if (!loan) return { error: '該当する貸出がありません。' };

  const { error } = await supabase
    .from('loans')
    .update({ returned_at: new Date().toISOString() } as never)
    .eq('id', (loan as { id: string }).id);

  if (error) return { error: '返却登録に失敗しました。' };

  const returnBookLines = [
    `${user.name} 様`,
    '',
    '以下の書籍の返却が完了しました。',
    '',
    '【対象書籍】',
    `　タイトル：${book.title}`,
    `　著者：${book.author}`,
    `　出版社：${book.publisher}`,
    `　ISBN：${book.isbn}`,
    '',
    'ご利用ありがとうございました。',
  ];
  await sendEmailAndLog({
    to: user.email,
    subject: '【ちよプラブックスペース】返却完了のご案内',
    text: returnBookLines.join('\n'),
    kind: 'return',
    recipientUserId: userId,
  });

  revalidatePath('/');
  revalidatePath('/reception/return');
  return { success: '返却を登録しました。' };
}
