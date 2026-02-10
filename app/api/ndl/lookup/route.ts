import { fetchBookByIsbn } from '@/lib/ndl/client';
import { getSession } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const isbn = req.nextUrl.searchParams.get('isbn');
  if (!isbn?.trim()) {
    return new Response(JSON.stringify({ error: 'isbn required' }), { status: 400 });
  }
  const book = await fetchBookByIsbn(isbn.trim());
  return Response.json(book ?? { error: 'not_found' });
}
