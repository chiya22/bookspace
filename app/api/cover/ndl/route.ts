import { NextRequest } from 'next/server';

// 2024年1月のNDLサーチリニューアルでURL形式変更。末尾に .jpg が必須。
const NDL_THUMBNAIL_BASE = 'https://ndlsearch.ndl.go.jp/thumbnail/';
const FETCH_TIMEOUT_MS = 8000;

/**
 * 国会図書館の書影をサーバー側で取得し、そのまま返すプロキシ。
 * ブラウザから直接 iss.ndl.go.jp を img で参照すると CORB でブロックされるため、
 * 同一オリジン経由で配信する。
 */
export async function GET(req: NextRequest) {
  const isbnRaw = req.nextUrl.searchParams.get('isbn');
  const isbn = isbnRaw?.replace(/-/g, '').trim();
  if (!isbn || !/^\d{10,13}$/.test(isbn)) {
    return new Response(null, { status: 400 });
  }

  try {
    const res = await fetch(`${NDL_THUMBNAIL_BASE}${isbn}.jpg`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'Bookspace/1.0' },
    });

    if (!res.ok) return new Response(null, { status: 404 });

    const contentType = res.headers.get('Content-Type') ?? 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return new Response(null, { status: 404 });
    }

    const bytes = await res.arrayBuffer();
    if (bytes.byteLength === 0) return new Response(null, { status: 404 });

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': contentType.split(';')[0]?.trim() || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
