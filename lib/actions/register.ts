'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';
import { buildQrCodeData } from '@/lib/qr/generate';
import { redirect } from 'next/navigation';
import type { Database } from '@/types/database';

const SALT_ROUNDS = 10;
type UserInsert = Database['public']['Tables']['users']['Insert'];

export type RegisterState = {
  error?: string;
};

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
    .single();
  if (existing) {
    return { error: 'このメールアドレスは既に登録されています。' };
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const insertPayload: UserInsert = {
    email,
    password_hash,
    name,
    display_name: displayName ?? name,
    role: 'user',
  };
  const { data: insertedRaw, error: insertError } = await supabase
    .from('users')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertPayload as any)
    .select('id, name')
    .single();

  if (insertError) {
    console.error(insertError);
    return { error: '登録に失敗しました。しばらくしてから再度お試しください。' };
  }

  const inserted = insertedRaw as { id: string; name: string } | null;
  if (!inserted) {
    return { error: '登録に失敗しました。' };
  }

  const qr_code_data = buildQrCodeData(inserted.id, inserted.name);
  // @ts-expect-error Supabase Database 型の推論で update が never になるため
  await supabase.from('users').update({ qr_code_data }).eq('id', inserted.id);

  redirect('/login?registered=1');
}
