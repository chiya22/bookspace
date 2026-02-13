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

export async function getUsersPaginated(
  page: number,
  pageSize: number
): Promise<{ users: UserRow[]; totalCount: number }> {
  const supabase = createSupabaseServerClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase
    .from('users')
    .select('id, email, name, role, disabled, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  return {
    users: (data ?? []) as UserRow[],
    totalCount: count ?? 0,
  };
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
