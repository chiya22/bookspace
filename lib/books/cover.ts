import { createSupabaseServerClient } from '@/lib/supabase/server';

const BUCKET = 'book-covers';

/**
 * 表紙画像の署名付きURLを取得する（ログイン済みユーザー用）。
 * path が null の場合は null を返す。
 */
export async function getCoverSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
  return data?.signedUrl ?? null;
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
