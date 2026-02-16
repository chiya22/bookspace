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
 * 国会図書館の書影APIのURLを返す。
 * 自前の表紙画像がない場合のフォールバック用。ISBN に該当する書影が存在しない場合は 404 になる。
 * @see https://ndlsearch.ndl.go.jp/help/api/thumbnail
 */
export function getNdlThumbnailUrl(isbn: string): string {
  const normalized = isbn.replace(/-/g, '');
  return normalized ? `https://iss.ndl.go.jp/thumbnail/${normalized}` : '';
}
