import type { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchCoverImageUrlByIsbn } from '@/lib/google-books/client';

export const COVER_BUCKET = 'book-covers';
const IMAGE_FETCH_TIMEOUT_MS = 8000;

/**
 * 画像 URL からバイナリを取得して Storage にアップロードし、保存したパスを返す。
 */
async function saveCoverImageFromUrl(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  bookId: string,
  imageUrl: string
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, {
      signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'Bookspace/1.0' },
    });
    if (!res.ok) return null;

    const contentType = res.headers.get('Content-Type') ?? 'image/jpeg';
    if (!contentType.startsWith('image/')) return null;

    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length === 0) return null;

    const ext = contentType.includes('png') ? '.png' : '.jpg';
    const storagePath = `${bookId}${ext}`;
    const { error } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(storagePath, bytes, {
        upsert: true,
        contentType: contentType.split(';')[0]?.trim() || 'image/jpeg',
      });
    if (error) return null;

    return storagePath;
  } catch {
    return null;
  }
}

/**
 * Google Books API から表紙を取得して Storage に保存し、保存したパスを返す。失敗時は null。
 */
export async function fetchAndSaveGoogleBooksCover(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  bookId: string,
  isbnNormalized: string
): Promise<string | null> {
  const imageUrl = await fetchCoverImageUrlByIsbn(isbnNormalized);
  if (!imageUrl) return null;
  return saveCoverImageFromUrl(supabase, bookId, imageUrl);
}

/**
 * プロキシ API 用: ISBN から表紙画像のバイナリを取得する。
 */
export async function fetchCoverImageBytesByIsbn(
  isbn: string
): Promise<{ bytes: ArrayBuffer; contentType: string } | null> {
  const imageUrl = await fetchCoverImageUrlByIsbn(isbn);
  if (!imageUrl) return null;

  try {
    const res = await fetch(imageUrl, {
      signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'Bookspace/1.0' },
    });
    if (!res.ok) return null;

    const contentType = res.headers.get('Content-Type') ?? 'image/jpeg';
    if (!contentType.startsWith('image/')) return null;

    const bytes = await res.arrayBuffer();
    if (bytes.byteLength === 0) return null;

    return {
      bytes,
      contentType: contentType.split(';')[0]?.trim() || 'image/jpeg',
    };
  } catch {
    return null;
  }
}
