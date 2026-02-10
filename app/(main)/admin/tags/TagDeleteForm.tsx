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
        className="text-sm text-red-600 underline hover:text-red-800"
      >
        削除
      </button>
    </form>
  );
}
