'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleFavorite } from '@/lib/actions/favorites';

type Props = {
  bookId: string;
  isFavorited: boolean;
};

export function FavoriteStarButton({ bookId, isFavorited }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await toggleFavorite(bookId, isFavorited);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="shrink-0 rounded p-1 text-lg leading-none text-amber-500 hover:bg-amber-50 disabled:opacity-50"
      title={isFavorited ? 'お気に入りを解除' : 'お気に入りに追加'}
      aria-label={isFavorited ? 'お気に入りを解除' : 'お気に入りに追加'}
    >
      {isFavorited ? '★' : '☆'}
    </button>
  );
}
