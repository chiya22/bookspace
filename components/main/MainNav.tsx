'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type MainNavProps = {
  name: string | null;
  role: string;
};

const navLinks = [
  { href: '/books', label: '蔵書検索' },
  { href: '/loans', label: '貸出履歴' },
  { href: '/account', label: 'アカウント' },
] as const;

const staffLinks = [
  { href: '/reception/loan', label: '貸出', isAdmin: false },
  { href: '/reception/return', label: '返却', isAdmin: false },
  { href: '/reception/loans', label: '貸出履歴一覧', isAdmin: false },
  { href: '/admin', label: '管理', isAdmin: true },
] as const;

export function MainNav({ name, role }: MainNavProps) {
  const isStaff = role === 'librarian' || role === 'admin';
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside, true);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [menuOpen]);

  const linkClass = (href: string, isAdmin?: boolean) =>
    isAdmin
      ? `block rounded px-3 py-2 text-sm font-medium hover:text-white ${
          isActive(href) ? 'bg-emerald-600 text-white' : 'text-emerald-50/80 hover:bg-emerald-800/70'
        }`
      : `block rounded px-3 py-2 text-sm font-deium hover:text-white ${
          isActive(href) ? 'bg-emerald-700 text-white' : 'text-emerald-50/80 hover:bg-emerald-800/70'
        }`;

  return (
    <nav
      ref={navRef}
      className="relative border-b border-emerald-900 bg-emerald-900/95 text-emerald-50 shadow-sm"
      aria-label="メインメニュー"
    >
      <div className="mx-auto flex h-14 min-h-[3.5rem] max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-6 md:gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center justify-center rounded-lg p-2 text-emerald-50 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="ホーム"
          >
            <svg
              className="h-6 w-6 sm:h-7 sm:w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </Link>

          {/* デスクトップ: 横並びリンク */}
          <div className="hidden flex-wrap items-center gap-1 md:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={
                  `rounded-full px-3 py-1 text-sm font-medium hover:bg-emerald-700 ${
                    isActive(href) ? 'bg-emerald-600 text-white' : 'text-white'
                }`}
              >
                {label}
              </Link>
            ))}
            {isStaff &&
              staffLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={
                      `rounded-full px-3 py-1 text-sm font-medium hover:bg-emerald-700 ${
                          isActive(href) ? 'bg-emerald-600 text-white' : 'text-white'
                        }`
                  }
                >
                  {label}
                </Link>
              ))}
          </div>
        </div>

        {/* デスクトップ: ユーザー名・ログアウト */}
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1.5 truncate text-sm text-white" aria-hidden>
            <svg
              className="h-4 w-4 shrink-0 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="truncate">{name ?? ''}</span>
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="rounded-full px-3 py-1 text-sm text-emerald-50/80 hover:bg-emerald-700 hover:text-white"
            aria-label="ログアウト"
          >
            ログアウト
          </button>
        </div>

        {/* モバイル: ハンバーガー + ユーザー名 */}
        <div className="flex items-center gap-2 md:hidden">
          <span className="flex items-center gap-1.5 truncate text-xs text-white sm:text-sm" aria-hidden>
            <svg
              className="h-4 w-4 shrink-0 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="truncate">{name ?? ''}</span>
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-emerald-50 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* モバイル: 開いたメニュー */}
      {menuOpen && (
        <div
          className="absolute left-0 right-0 top-full z-50 border-t border-emerald-800 bg-emerald-900/98 shadow-lg md:hidden"
          role="dialog"
          aria-label="メニュー"
        >
          <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={linkClass(href)}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {isStaff &&
                staffLinks.map(({ href, label, isAdmin }) => (
                  <Link
                    key={href}
                    href={href}
                    className={linkClass(href, isAdmin)}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              <div className="mt-2 border-t border-emerald-800 pt-2">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full py-2 text-left text-sm text-emerald-50/80 hover:text-white"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
