const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1/volumes';
const FETCH_TIMEOUT_MS = 10000;

type GoogleBooksImageLinks = {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
};

function normalizeImageUrl(url: string): string {
  return url.replace(/^http:/, 'https:');
}

function pickBestImageUrl(links: GoogleBooksImageLinks): string | null {
  const raw =
    links.extraLarge ??
    links.large ??
    links.medium ??
    links.thumbnail ??
    links.small ??
    links.smallThumbnail;
  return raw ? normalizeImageUrl(raw) : null;
}

/**
 * ISBN で Google Books API を検索し、表紙画像 URL を返す。見つからない場合は null。
 */
export async function fetchCoverImageUrlByIsbn(isbn: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) return null;

  const normalized = isbn.replace(/-/g, '').trim();
  if (!normalized) return null;

  const url = new URL(GOOGLE_BOOKS_API_BASE);
  url.searchParams.set('q', `isbn:${normalized}`);
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('key', apiKey);

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      items?: Array<{ volumeInfo?: { imageLinks?: GoogleBooksImageLinks } }>;
    };
    const imageLinks = data.items?.[0]?.volumeInfo?.imageLinks;
    if (!imageLinks) return null;

    return pickBestImageUrl(imageLinks);
  } catch {
    return null;
  }
}
