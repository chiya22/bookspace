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
    <div className="min-h-screen bg-[color:var(--background)]">
      <MainNav name={displayName} role={session.user.role} />
      <main
        id="main"
        className="mx-auto min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
