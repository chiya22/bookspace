import { getSession } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainNav } from '@/components/main/MainNav';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const supabase = createSupabaseServerClient();
  const { data: userRow } = await supabase
    .from('users')
    .select('display_name, name')
    .eq('id', session.user.id)
    .single();
  type Row = { display_name: string | null; name: string } | null;
  const row = userRow as Row;
  const displayName = row?.display_name ?? row?.name ?? session.user.name ?? '';

  return (
    <>
      <MainNav name={displayName} role={session.user.role} />
      <main id="main" className="mx-auto max-w-4xl px-4 py-6" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
