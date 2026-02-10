'use client';

import { useState } from 'react';

type Props = {
  src: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

/**
 * 表紙画像。src が null または読み込みに失敗した場合は「表紙なし」を表示。
 * 国会図書館の書影API（外部URL）をフォールバックで使う場合、404 時もこのコンポーネントで扱う。
 */
export function CoverImage({ src, alt, className, width, height }: Props) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={className}
        style={{ width: width ?? 128, height: height ?? 192 }}
      >
        <div className="flex h-full w-full items-center justify-center rounded bg-zinc-100 text-sm text-zinc-400">
          表紙なし
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={() => setError(true)}
    />
  );
}
