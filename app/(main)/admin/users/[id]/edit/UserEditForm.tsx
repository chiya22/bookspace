'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { UserRow } from '@/lib/users/queries';
import type { UpdateUserState } from '@/lib/actions/users';

type UserEditFormProps = {
  user: UserRow;
  action: (prev: UpdateUserState, formData: FormData) => Promise<UpdateUserState>;
};


export function UserEditForm({ user, action }: UserEditFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="userId" value={user.id} />
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">名前</label>
        <input
          type="text"
          name="name"
          defaultValue={user.name}
          required
          autoFocus
          className="w-full rounded border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">メール</label>
        <input
          type="email"
          name="email"
          defaultValue={user.email}
          required
          className="w-full rounded border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">役割</label>
        <select
          name="role"
          defaultValue={user.role}
          className="w-full rounded border border-zinc-300 px-3 py-2 text-zinc-900"
        >
          <option value="user">利用者</option>
          <option value="librarian">受付者</option>
          <option value="admin">管理者</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="disabled"
          id="disabled"
          defaultChecked={user.disabled}
          className="h-4 w-4 rounded border-zinc-300"
        />
        <label htmlFor="disabled" className="text-sm text-zinc-700">
          無効化（ログイン不可にする）
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800"
        >
          保存
        </button>
        <Link
          href="/admin/users"
          className="rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
