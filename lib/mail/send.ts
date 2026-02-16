'use server';

import { Resend } from 'resend';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const mailFrom = process.env.MAIL_FROM ?? 'ちよプラブックスペース <onboarding@resend.dev>';

export type EmailKind = 'loan' | 'return' | 'return_request' | 'password_reset' | 'email_verification';

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };

/**
 * メールを送信し、成功時に email_logs に記録する。
 * RESEND_API_KEY が未設定の場合は送信せず { ok: true } を返す（開発時スキップ用）。
 */
export async function sendEmailAndLog(params: {
  to: string;
  subject: string;
  text: string;
  kind: EmailKind;
  recipientUserId?: string | null;
}): Promise<SendEmailResult> {
  if (!resend) {
    return { ok: true };
  }

  const { data, error } = await resend.emails.send({
    from: mailFrom,
    to: params.to,
    subject: params.subject,
    text: params.text,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const supabase = createSupabaseServerClient();
  await supabase.from('email_logs').insert({
    kind: params.kind,
    recipient_user_id: params.recipientUserId ?? null,
    recipient_email: params.to,
    subject: params.subject,
  } as never);

  return { ok: true, id: data?.id };
}
