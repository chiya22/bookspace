'use server';

import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { messages } from '@/lib/messages';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type UpdateTagState = { error?: string };

export async function createTag(
  _prev: UpdateTagState,
  formData: FormData
): Promise<UpdateTagState> {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: messages.noPermission };
  }

  const name = formData.get('name')?.toString()?.trim();
  if (!name) return { error: messages.requiredTagName };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('tags').insert({ name } as never);

  if (error) {
    if (error.code === '23505') return { error: messages.tagNameAlreadyUsed };
    return { error: messages.failedToAdd };
  }

  revalidatePath('/admin/tags');
  revalidatePath('/admin/books');
  revalidatePath('/books');
  redirect('/admin/tags');
}

export async function deleteTag(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return;
  }

  const tagId = formData.get('tagId')?.toString();
  if (!tagId) return;

  const supabase = createSupabaseServerClient();
  await supabase.from('tags').delete().eq('id', tagId);

  revalidatePath('/admin/tags');
  revalidatePath('/admin/books');
  revalidatePath('/books');
  redirect('/admin/tags');
}

export async function updateTag(
  _prev: UpdateTagState,
  formData: FormData
): Promise<UpdateTagState> {
  const session = await getSession();
  if (!session?.user || (session.user.role !== 'librarian' && session.user.role !== 'admin')) {
    return { error: messages.noPermission };
  }

  const tagId = formData.get('tagId')?.toString();
  if (!tagId) return { error: messages.tagNotSpecified };

  const name = formData.get('name')?.toString()?.trim();
  if (!name) return { error: messages.requiredTagName };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('tags').update({ name } as never).eq('id', tagId);

  if (error) {
    if (error.code === '23505') return { error: messages.tagNameAlreadyUsed };
    return { error: messages.failedToUpdate };
  }

  revalidatePath('/admin/tags');
  revalidatePath('/admin/books');
  revalidatePath('/books');
  redirect('/admin/tags');
}
