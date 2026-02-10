import { XMLParser } from 'fast-xml-parser';

const OPENSEARCH_BASE = 'https://ndlsearch.ndl.go.jp/api/opensearch';

export type NdlBookInfo = {
  title: string;
  author: string;
  publisher: string;
  isbn: string;
};

/**
 * ISBN で国会図書館サーチ API（OpenSearch）を検索し、1件目の書誌を返す。
 */
export async function fetchBookByIsbn(isbn: string): Promise<NdlBookInfo | null> {
  const normalized = isbn.replace(/-/g, '');
  if (!normalized) return null;
  const url = `${OPENSEARCH_BASE}?cnt=1&isbn=${encodeURIComponent(normalized)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: true });
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel ?? parsed?.feed;
    if (!channel) return null;
    const item = Array.isArray(channel.item) ? channel.item[0] : channel.item;
    if (!item) return null;
    const title = (item.title ?? '').trim();
    const author = (item['dc:creator'] ?? item.creator ?? '').trim();
    const publisher = (item['dc:publisher'] ?? item.publisher ?? '').trim();
    const isbnFromApi = (item['dc:identifier'] ?? item.identifier ?? '')
      .toString()
      .replace(/-/g, '');
    return {
      title: title || '（タイトルなし）',
      author: author || '（著者なし）',
      publisher: publisher || '（出版社なし）',
      isbn: isbnFromApi || normalized,
    };
  } catch {
    return null;
  }
}
