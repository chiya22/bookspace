'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';
import { sendEmailAndLog } from '@/lib/mail/send';
import crypto from 'node:crypto';

const SALT_ROUNDS = 10;
const TOKEN_BYTES = 32;
const EXPIRY_HOURS = 24;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

export type RegisterState = {
  error?: string;
  success?: string;
};

/**
 * 会員登録の申請を行う。入力されたメールアドレスに確認メールを送信する。
 * メール内のリンクをクリックすると本登録が完了する。
 */
export async function registerUser(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = formData.get('email')?.toString()?.trim();
  const password = formData.get('password')?.toString();
  const name = formData.get('name')?.toString()?.trim();
  const displayName = formData.get('display_name')?.toString()?.trim() || null;

  if (!email || !password || !name) {
    return { error: 'メール・パスワード・名前を入力してください。' };
  }
  if (password.length < 8) {
    return { error: 'パスワードは8文字以上にしてください。' };
  }

  const supabase = createSupabaseServerClient();

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existing) {
    return { error: 'このメールアドレスは既に登録されています。' };
  }

  await supabase.from('pending_registrations').delete().eq('email', email);

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

  const { error: insertError } = await supabase.from('pending_registrations').insert({
    email,
    name,
    display_name: displayName,
    password_hash,
    token_hash: tokenHash,
    expires_at: expiresAt,
  } as never);

  if (insertError) {
    console.error(insertError);
    return { error: '登録の受け付けに失敗しました。しばらくしてから再度お試しください。' };
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/register/verify-email?token=${encodeURIComponent(token)}`;

  const body = [
    `${name} 様`,
    '',
    'ちよプラブックスペースの会員登録を受け付けました。',
    '以下のリンクをクリックして、メールアドレスを確認し登録を完了してください。',
    '',
    verifyUrl,
    '',
    `このリンクは ${EXPIRY_HOURS} 時間で無効になります。`,
    '心当たりがない場合はこのメールを無視してください。',
  ].join('\n');

  const result = await sendEmailAndLog({
    to: email,
    subject: '【ちよプラブックスペース】会員登録の確認',
    text: body,
    kind: 'email_verification',
    recipientUserId: null,
  });

  if (!result.ok) {
    return { error: '確認メールの送信に失敗しました。メールアドレスをご確認のうえ、再度お試しください。' };
  }

  return {
    success:
      '確認メールを送信しました。届いたメール内のリンクをクリックして、登録を完了してください。',
  };
}
