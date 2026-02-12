import { XMLParser } from 'fast-xml-parser';

const OPENSEARCH_BASE = 'https://ndlsearch.ndl.go.jp/api/opensearch';

function toText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((v) => (v == null ? '' : String(v))).join(', ');
  }
  if (value == null) return '';
  return String(value);
}

export type NdlBookInfo = {
  title: string;
  author: string;
  publisher: string;
  isbn: string;
};

/**
 * ISBN で国会図書館サーチ API（OpenSearch）を検索し、1件目の書誌を返す。
 *
 * NDL Search の OpenSearch は RSS 形式（rss/channel/item）と
 * Atom 形式（feed/entry）のどちらでも返ってくる可能性があるため、
 * 両方のパターンに対応してパースする。
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

    // RSS 2.0 形式（rss/channel/item）
    const rssChannel = parsed?.rss?.channel;
    if (rssChannel) {
      const item = Array.isArray(rssChannel.item) ? rssChannel.item[0] : rssChannel.item;
      if (item) {
        const title = toText(item.title).trim();
        const author = toText(item['dc:creator'] ?? item.author ?? item.creator).trim();
        const publisher = toText(item['dc:publisher'] ?? item.publisher).trim();

        const identifiers = item['dc:identifier'] ?? item.identifier ?? '';
        let isbnFromApi = '';
        if (Array.isArray(identifiers)) {
          const firstIsbn = identifiers.find(
            (v) => typeof v === 'string' && /\d{9,}/.test(v),
          ) as string | undefined;
          isbnFromApi = firstIsbn ? firstIsbn.replace(/-/g, '') : identifiers.map(String).join('').replace(/-/g, '');
        } else {
          isbnFromApi = String(identifiers).replace(/-/g, '');
        }

        return {
          title: title || '（タイトルなし）',
          author: author || '（著者なし）',
          publisher: publisher || '（出版社なし）',
          isbn: isbnFromApi || normalized,
        };
      }
    }

    // Atom 形式（feed/entry）
    const feed = parsed?.feed;
    if (feed) {
      const entry = Array.isArray(feed.entry) ? feed.entry[0] : feed.entry;
      if (entry) {
        const title = toText(entry.title).trim();
        const rawAuthor =
          entry['dc:creator'] ??
          entry.creator ??
          // Atom の author 要素（{ author: { name: '...' } }）に対応
          (typeof entry.author === 'object' && entry.author !== null
            ? (entry.author as { name?: unknown }).name ?? entry.author
            : entry.author);
        const author = toText(rawAuthor).trim();
        const publisher = toText(entry['dc:publisher'] ?? entry.publisher).trim();

        const identifiers = entry['dc:identifier'] ?? entry.identifier ?? '';
        let isbnFromApi = '';
        if (Array.isArray(identifiers)) {
          const firstIsbn = identifiers.find(
            (v) => typeof v === 'string' && /\d{9,}/.test(v),
          ) as string | undefined;
          isbnFromApi = firstIsbn ? firstIsbn.replace(/-/g, '') : identifiers.map(String).join('').replace(/-/g, '');
        } else {
          isbnFromApi = String(identifiers).replace(/-/g, '');
        }

        return {
          title: title || '（タイトルなし）',
          author: author || '（著者なし）',
          publisher: publisher || '（出版社なし）',
          isbn: isbnFromApi || normalized,
        };
      }
    }

    // どちらの形式でも書誌が取得できなかった
    return null;
  } catch {
    return null;
  }
}
