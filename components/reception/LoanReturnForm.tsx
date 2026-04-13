'use client';

import { useRef, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

type UserOption = {
  id: string;
  name: string;
  displayName: string | null;
};

type Props = {
  mode: 'loan' | 'return';
  action: (prev: { error?: string; success?: string }, fd: FormData) => Promise<{ error?: string; success?: string }>;
  isAdmin?: boolean;
  users?: UserOption[];
};

function SubmitButton({ isLoan }: { isLoan: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`rounded-full px-5 py-1.5 text-[13px] font-medium text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 disabled:pointer-events-none disabled:opacity-70 ${
        isLoan ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-zinc-800 hover:bg-zinc-700'
      }`}
    >
      {pending ? '処理中…' : isLoan ? '貸出' : '返却'}
    </button>
  );
}

function UserSelect({ users }: { users: UserOption[] }) {
  const [filter, setFilter] = useState('');
  const filtered = filter
    ? users.filter((u) => {
        const label = u.displayName ?? u.name;
        return label.includes(filter) || u.name.includes(filter);
      })
    : users;

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-700">利用者を選択</label>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="名前で絞り込み…"
        className="mb-1.5 w-full rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
      />
      <select
        name="qr_data"
        required
        className="w-full rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
        defaultValue=""
      >
        <option value="" disabled>
          -- 利用者を選択してください --
        </option>
        {filtered.map((u) => (
          <option key={u.id} value={u.id}>
            {u.displayName ?? u.name}（{u.name}）
          </option>
        ))}
      </select>
      {filter && filtered.length === 0 && (
        <p className="mt-1 text-xs text-zinc-500">該当する利用者が見つかりません。</p>
      )}
    </div>
  );
}

export function LoanReturnForm({ mode, action, isAdmin, users }: Props) {
  const [state, formAction] = useActionState(action, {});
  const isbnInputRef = useRef<HTMLInputElement>(null);
  const qrDataRef = useRef<HTMLTextAreaElement>(null);

  const isLoan = mode === 'loan';

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-col gap-4"
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.preventDefault();
      }}
    >
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          {state.success}
        </p>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700">書籍のISBN</label>
        <input
          ref={isbnInputRef}
          type="text"
          name="isbn"
          placeholder="978-4-..."
          required
          autoFocus
          className="w-full rounded border border-zinc-300 px-3 py-2 text-[13px] text-zinc-900"
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '');
            if (digits.length >= 13 && !isAdmin) {
              setTimeout(() => qrDataRef.current?.focus(), 100);
            }
          }}
        />
      </div>
      {isAdmin && users ? (
        <UserSelect users={users} />
      ) : (
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700">
            会員証QRコード（スキャン結果）
          </label>
          <textarea
            ref={qrDataRef}
            name="qr_data"
            rows={3}
            placeholder='{"userId":"...","name":"..."} の形式でスキャン結果を貼り付けてください'
            className="w-full rounded border border-zinc-300 px-3 py-2 font-mono text-[13px] text-zinc-900"
          />
          <p className="mt-1 text-xs text-zinc-500">
            QRスキャンで取得した文字列をそのまま貼り付けるか、利用者IDのみを入力してください。
          </p>
        </div>
      )}
      <SubmitButton isLoan={isLoan} />
    </form>
  );
}
