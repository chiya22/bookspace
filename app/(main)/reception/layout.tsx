import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'librarian' && session.user.role !== 'admin') {
    redirect('/');
  }
  return <>{children}</>;
}
