import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database';

export type UserRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  disabled: boolean;
  created_at: string;
};

export async function getAllUsers(): Promise<UserRow[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('users')
    .select('id, email, name, role, disabled, created_at')
    .order('created_at', { ascending: false });
  return (data ?? []) as UserRow[];
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('users')
    .select('id, email, name, role, disabled, created_at')
    .eq('id', id)
    .maybeSingle();
  return data as UserRow | null;
}
