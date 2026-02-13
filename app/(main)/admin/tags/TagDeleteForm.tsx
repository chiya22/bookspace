'use client';

import { useRef } from 'react';

type TagDeleteFormProps = {
  tagId: string;
  tagName: string;
  action: (formData: FormData) => Promise<void>;
};

export function TagDeleteForm({ tagId, tagName, action }: TagDeleteFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (window.confirm(`タグ「${tagName}」を削除しますか？\nこのタグが付いている書籍からも外れます。`)) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={action} className="inline">
      <input type="hidden" name="tagId" value={tagId} readOnly aria-hidden />
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-100 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
      >
        削除
      </button>
    </form>
  );
}
