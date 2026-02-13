import Link from 'next/link';

type Props = {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  basePath: string;
  /** 既存のクエリパラメータ（page 以外）。リンクに付与する。値は文字列または文字列配列（同一キーで複数） */
  searchParams?: Record<string, string | string[] | undefined>;
};

export function PaginationNav({
  totalCount,
  pageSize,
  currentPage,
  basePath,
  searchParams = {},
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  function buildUrl(page: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => v !== undefined && params.append(key, v));
      } else {
        params.set(key, value);
      }
    }
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  if (totalCount === 0) return null;

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  // 表示するページ番号（現在の前後＋先頭・末尾）
  const pageNumbers: number[] = [];
  const add = (p: number) => {
    if (p >= 1 && p <= totalPages && !pageNumbers.includes(p)) pageNumbers.push(p);
  };
  add(1);
  add(currentPage - 1);
  add(currentPage);
  add(currentPage + 1);
  add(totalPages);
  pageNumbers.sort((a, b) => a - b);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-4"
      aria-label="ページネーション"
    >
      <p className="text-sm text-zinc-600">
        {totalCount}件中 {from}–{to}件目を表示
      </p>
      <div className="flex items-center gap-1">
        {prevPage !== null ? (
          <Link
            href={buildUrl(prevPage)}
            className="rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            前へ
          </Link>
        ) : (
          <span className="rounded border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-400">
            前へ
          </span>
        )}
        <span className="flex items-center gap-0.5">
          {pageNumbers.map((p, i) => {
            const showEllipsisBefore = i > 0 && p - pageNumbers[i - 1]! > 1;
            return (
              <span key={p} className="flex items-center gap-0.5">
                {showEllipsisBefore && <span className="px-1 text-zinc-400">…</span>}
                {p === currentPage ? (
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded border border-emerald-600 bg-emerald-50 text-sm font-medium text-emerald-800"
                    aria-current="page"
                  >
                    {p}
                  </span>
                ) : (
                  <Link
                    href={buildUrl(p)}
                    className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 bg-white text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    {p}
                  </Link>
                )}
              </span>
            );
          })}
        </span>
        {nextPage !== null ? (
          <Link
            href={buildUrl(nextPage)}
            className="rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            次へ
          </Link>
        ) : (
          <span className="rounded border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-400">
            次へ
          </span>
        )}
      </div>
    </nav>
  );
}
