import { fetchCoverImageBytesByIsbn } from '@/lib/books/cover-fetch';
import { NextRequest } from 'next/server';

/**
 * Google Books の表紙をサーバー側で取得し、そのまま返すプロキシ。
 * 自前 Storage に表紙がない場合のフォールバック表示用。
 */
export async function GET(req: NextRequest) {
  const isbnRaw = req.nextUrl.searchParams.get('isbn');
  const isbn = isbnRaw?.replace(/-/g, '').trim();
  if (!isbn || !/^\d{10,13}$/.test(isbn)) {
    return new Response(null, { status: 400 });
  }

  const result = await fetchCoverImageBytesByIsbn(isbn);
  if (!result) return new Response(null, { status: 404 });

  return new Response(result.bytes, {
    status: 200,
    headers: {
      'Content-Type': result.contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
