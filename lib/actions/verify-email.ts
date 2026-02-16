'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buildQrCodeData } from '@/lib/qr/generate';
import crypto from 'node:crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export type VerifyEmailResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * メール認証トークンを検証し、本登録（users 作成）を行う。
 */
export async function completeRegistrationWithToken(
  token: string
): Promise<VerifyEmailResult> {
  if (!token.trim()) {
    return { ok: false, error: 'リンクが無効です。' };
  }

  const tokenHash = hashToken(token.trim());
  const supabase = createSupabaseServerClient();

  const { data: row } = await supabase
    .from('pending_registrations')
    .select('id, email, name, display_name, password_hash, expires_at')
    .eq('token_hash', tokenHash)
    .limit(1)
    .maybeSingle();

  type PendingRow = {
    id: string;
    email: string;
    name: string;
    display_name: string | null;
    password_hash: string;
    expires_at: string;
  };
  const pending = row as PendingRow | null;

  if (!pending) {
    return { ok: false, error: 'リンクが無効または期限切れです。再度会員登録からお試しください。' };
  }

  if (new Date(pending.expires_at) < new Date()) {
    await supabase.from('pending_registrations').delete().eq('id', pending.id);
    return { ok: false, error: 'リンクの有効期限が切れています。再度会員登録からお試しください。' };
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', pending.email)
    .maybeSingle();
  if (existing) {
    await supabase.from('pending_registrations').delete().eq('id', pending.id);
    return { ok: false, error: 'このメールアドレスは既に登録済みです。ログインしてください。' };
  }

  const { data: insertedRaw, error: insertError } = await supabase
    .from('users')
    .insert({
      email: pending.email,
      password_hash: pending.password_hash,
      name: pending.name,
      display_name: pending.display_name ?? pending.name,
      role: 'user',
    } as never)
    .select('id, name')
    .single();

  if (insertError) {
    console.error(insertError);
    return { ok: false, error: '登録の完了に失敗しました。しばらくしてから再度お試しください。' };
  }

  const inserted = insertedRaw as { id: string; name: string } | null;
  if (!inserted) {
    return { ok: false, error: '登録の完了に失敗しました。' };
  }

  const qr_code_data = buildQrCodeData(inserted.id, inserted.name);
  await supabase.from('users').update({ qr_code_data } as never).eq('id', inserted.id);

  await supabase.from('pending_registrations').delete().eq('id', pending.id);

  return { ok: true };
}
