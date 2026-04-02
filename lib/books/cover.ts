import { unstable_cache } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const BUCKET = 'book-covers';
const SIGNED_URL_EXPIRY_SEC = 60;
const CACHE_REVALIDATE_SEC = 45;

async function getCoverSignedUrlUncached(path: string): Promise<string | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_EXPIRY_SEC);
  return data?.signedUrl ?? null;
}

/**
 * 表紙画像の署名付きURLを取得する（ログイン済みユーザー用）。
 * path が null の場合は null を返す。
 * 同一 path は短時間キャッシュし、Vercel 上での応答を軽くする。
 */
export async function getCoverSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  return unstable_cache(
    () => getCoverSignedUrlUncached(path),
    ['cover-signed-url', path],
    { revalidate: CACHE_REVALIDATE_SEC, tags: ['book-covers'] }
  )();
}

/**
 * 複数の表紙画像パスに対して署名付きURLを一括取得する。
 * Supabase Storage の createSignedUrls バッチAPIを使い、1回のHTTPコールで取得。
 * unstable_cache はJSON シリアライズするため、Map ではなくプレーンオブジェクトを返す。
 */
async function getCoverSignedUrlsBatchUncached(paths: string[]): Promise<Record<string, string>> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_EXPIRY_SEC);
  const result: Record<string, string> = {};
  for (const item of data ?? []) {
    if (item.path && item.signedUrl && !item.error) {
      result[item.path] = item.signedUrl;
    }
  }
  return result;
}

/**
 * 複数の表紙画像パスに対して署名付きURLを一括取得する（キャッシュ付き）。
 * null を除外し、有効なパスだけを対象にする。
 */
async function getCoverSignedUrls(paths: (string | null)[]): Promise<Record<string, string>> {
  const validPaths = [...new Set(paths.filter((p): p is string => p != null))];
  if (validPaths.length === 0) return {};
  const sorted = [...validPaths].sort();
  return unstable_cache(
    () => getCoverSignedUrlsBatchUncached(sorted),
    ['cover-signed-urls-batch', ...sorted],
    { revalidate: CACHE_REVALIDATE_SEC, tags: ['book-covers'] }
  )();
}

/**
 * 書籍リストの表紙URLを一括解決する。
 * Supabase Storage の署名URL をバッチ取得し、ない場合は NDL サムネイルにフォールバック。
 */
export async function resolveCoverUrls(
  books: { cover_image_path: string | null; isbn: string }[]
): Promise<(string | null)[]> {
  const signedUrls = await getCoverSignedUrls(books.map((b) => b.cover_image_path));
  return books.map((book) => {
    if (book.cover_image_path) {
      const signed = signedUrls[book.cover_image_path];
      if (signed) return signed;
    }
    return getNdlThumbnailUrl(book.isbn) || null;
  });
}

/**
 * 国会図書館の書影を表示するためのURLを返す。
 * 自前の表紙画像がない場合のフォールバック用。同一オリジンのプロキシ経由で配信するため、
 * ブラウザでの CORB ブロックを避けられる。ISBN に該当する書影が存在しない場合は 404 になる。
 * @see https://ndlsearch.ndl.go.jp/help/api/thumbnail
 * @see docs/ndl-cover-corb.md
 */
export function getNdlThumbnailUrl(isbn: string): string {
  const normalized = isbn.replace(/-/g, '');
  return normalized ? `/api/cover/ndl?isbn=${encodeURIComponent(normalized)}` : '';
}
