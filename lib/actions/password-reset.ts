'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmailAndLog } from '@/lib/mail/send';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import crypto from 'node:crypto';

const SALT_ROUNDS = 10;
const TOKEN_BYTES = 32;
const EXPIRY_HOURS = 1;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

export type RequestResetState = { error?: string; success?: string };

/**
 * パスワードリセット用メールを送信する。
 * 登録されていないメールの場合は送信しないが、画面では同じメッセージを返す（列挙対策）。
 */
export async function requestPasswordReset(
  _prev: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = formData.get('email')?.toString()?.trim();
  if (!email) return { error: 'メールアドレスを入力してください。' };

  const supabase = createSupabaseServerClient();
  const { data: userRow } = await supabase
    .from('users')
    .select('id, name, disabled')
    .eq('email', email)
    .maybeSingle();

  type UserRow = { id: string; name: string; disabled: boolean };
  const user = userRow as UserRow | null;

  if (!user || user.disabled) {
    return { success: 'ご入力のメールアドレスにリセット用のリンクを送信しました。届かない場合はしばらくしてから再度お試しください。' };
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

  const { error: insertError } = await supabase.from('password_reset_tokens').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  } as never);

  if (insertError) {
    return { error: 'リセット用メールの送信に失敗しました。しばらくしてから再度お試しください。' };
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const resetUrl = `${baseUrl}/login/reset-password?token=${encodeURIComponent(token)}`;

  const body = [
    `${user.name} 様`,
    '',
    'パスワードのリセットを受け付けました。',
    '下記のリンクをクリックし、新しいパスワードを設定してください。',
    '',
    resetUrl,
    '',
    `このリンクは ${EXPIRY_HOURS} 時間で無効になります。`,
    '心当たりがない場合はこのメールを無視してください。',
  ].join('\n');

  const result = await sendEmailAndLog({
    to: email,
    subject: '【ちよプラブックスペース】パスワードのリセット',
    text: body,
    kind: 'password_reset',
    recipientUserId: user.id,
  });

  if (!result.ok) {
    return { error: 'メールの送信に失敗しました。しばらくしてから再度お試しください。' };
  }

  return { success: 'ご入力のメールアドレスにリセット用のリンクを送信しました。届かない場合はしばらくしてから再度お試しください。' };
}

export type ResetPasswordState = { error?: string };

/**
 * トークンを使ってパスワードを更新する。
 */
export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get('token')?.toString()?.trim();
  const password = formData.get('password')?.toString();
  const passwordConfirm = formData.get('password_confirm')?.toString();

  if (!token) return { error: 'リセット用のリンクが無効です。' };
  if (!password || password.length < 8) return { error: 'パスワードは8文字以上で入力してください。' };
  if (password !== passwordConfirm) return { error: 'パスワードと確認用が一致しません。' };

  const tokenHash = hashToken(token);
  const supabase = createSupabaseServerClient();

  const { data: row } = await supabase
    .from('password_reset_tokens')
    .select('id, user_id, expires_at')
    .eq('token_hash', tokenHash)
    .limit(1)
    .maybeSingle();

  type TokenRow = { id: string; user_id: string; expires_at: string };
  const tokenRow = row as TokenRow | null;

  if (!tokenRow) {
    return { error: 'リセット用のリンクが無効または期限切れです。再度パスワードを忘れた方から手続きしてください。' };
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    await supabase.from('password_reset_tokens').delete().eq('id', tokenRow.id);
    return { error: 'リセット用のリンクの有効期限が切れています。再度パスワードを忘れた方から手続きしてください。' };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash: passwordHash } as never)
    .eq('id', tokenRow.user_id);

  if (updateError) {
    return { error: 'パスワードの更新に失敗しました。' };
  }

  await supabase.from('password_reset_tokens').delete().eq('user_id', tokenRow.user_id);

  redirect('/login?reset=1');
}
