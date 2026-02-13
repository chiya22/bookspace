const DEFAULT_PAGE_SIZE = 20;

/**
 * 一覧画面の最大表示件数。環境変数 PAGINATION_PAGE_SIZE で変更可能（正の整数）。
 */
export function getPageSize(): number {
  const raw = process.env.PAGINATION_PAGE_SIZE?.trim();
  if (raw === undefined || raw === '') return DEFAULT_PAGE_SIZE;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(n, 1000); // 上限
}

/**
 * URL の page パラメータをパース。無効な場合は 1。
 */
export function parsePage(searchParams: { page?: string | string[] }): number {
  const p = searchParams.page;
  if (p == null) return 1;
  const s = Array.isArray(p) ? p[0] : p;
  const n = parseInt(s ?? '', 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function getTotalPages(totalCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

export function sliceForPage<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
