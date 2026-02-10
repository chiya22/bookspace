# Next.js App Router ベストプラクティス

本プロジェクトでは Next.js App Router を用いる。開発は **このドキュメントに準拠** して進める。

参照: [Next.js App Router 公式ドキュメント](https://nextjs.org/docs/app)

---

## 1. ファイル・フォルダ規約

### 1.1 特殊ファイル（Special Files）

| ファイル | 役割 | 備考 |
|----------|------|------|
| `page.tsx` | ルートに表示するUI。**default export** の React コンポーネント。 | 必須。1セグメントに1つ。 |
| `layout.tsx` | 複数ページで共有するUI。**children** で子を描画。 | ルートには必須（html/body を含む）。 |
| `loading.tsx` | 読み込み中のUI（Suspense の fallback）。 | 任意。セグメント単位。 |
| `error.tsx` | エラーバウンダリ。**error**, **reset** を受け取る。 | 任意。クライアントコンポーネント推奨。 |
| `not-found.tsx` | 404 表示。 | 任意。ルートまたはセグメント。 |
| `route.ts` | API Route Handler（GET/POST 等）。 | API が必要な場合のみ。 |

- フォルダ名が **URL セグメント** になる。`(括弧)` は Route Group（URL に含まれない）。
- 動的セグメントは **`[segmentName]`**（例: `[id]`, `[slug]`）。

### 1.2 命名規則

- コンポーネントファイル: **PascalCase**（例: `BookList.tsx`）。
- ユーティリティ・lib: **camelCase** または **kebab-case**（例: `getBooks.ts`, `supabase/client.ts`）。
- フォルダ: **小文字** または **kebab-case**（例: `books`, `admin/users`）。Route Group は `(auth)` のように括弧付き。

---

## 2. Server Components と Client Components

### 2.1 基本方針

- **デフォルトは Server Component**。`"use client"` を書かない限りサーバーでレンダリングされる。
- サーバーでデータ取得・DB アクセス・機密情報の扱いを行い、クライアント JS を減らす。

### 2.2 Client Component にする場合

次のいずれかが必要なときだけ **先頭に `"use client"`** を付ける。

- イベントハンドラ（`onClick`, `onChange` 等）
- `useState`, `useEffect`, `useContext` 等の React フック
- ブラウザ専用 API（`window`, カメラ、QR スキャン等）
- サードパーティのクライアント専用ライブラリ

### 2.3 コンポーネントの分割

- **Client Component は必要最小限の範囲に留める**。インタラクティブな部分だけを子コンポーネントにして `"use client"` を付ける。
- Server Component から Client Component には **props でデータを渡す**。Client から Server への直接のデータ取得は不可（API または Server Action 経由）。

---

## 3. データ取得

### 3.1 サーバーで取得する

- **データは使う場所（ページまたはレイアウト）で取得**する。グローバルな「データ取得層」を無理に作らない。
- Server Component 内で **async/await** でそのまま fetch または DB アクセスしてよい。Next.js がリクエストを重複排除する。

```ts
// ページで直接取得
export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBookById(id); // サーバー側の関数
  return <BookDetail book={book} />;
}
```

### 3.2 キャッシュ

- **fetch** はデフォルトでキャッシュされる。都度最新が必要な場合は `cache: 'no-store'` または `revalidate` を指定。
- サーバー用のデータ取得関数で **React `cache()`** を使うと、同一リクエスト内で重複呼び出しがまとまる（任意）。

### 3.3 ストリーミング・Suspense

- 読み込みが重い部分は **`<Suspense fallback={...}>`** で囲み、まずページの骨組みを返してから遅延部分をストリーミングする。
- セグメントに **`loading.tsx`** を置くと、そのセグメントのデフォルトのローディング UI になる。

---

## 4. ルーティング・レイアウト

### 4.1 Layout

- **ルートレイアウト**（`app/layout.tsx`）は必須。`<html>` と `<body>` を含める。
- セグメントごとに **layout.tsx** を置くと、そのセグメント以下で共通の UI を包める。ナビゲーション時もレイアウトは再レンダリングされず状態が保たれる。
- Layout は **children** を必ず描画する。

```tsx
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
```

### 4.2 動的セグメントの params

- **Next.js 15 以降、page と layout の `params` は Promise**。必ず **await** してから使う。

```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ...
}
```

### 4.3 searchParams

- ページで **searchParams** を受け取る場合も **Promise**（Next.js 15 以降）。検索・フィルタ用。

```ts
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const q = await searchParams;
  const keyword = typeof q.keyword === 'string' ? q.keyword : undefined;
  // ...
}
```

- **searchParams** を使うとそのページは **動的レンダリング** になる（リクエストごとにレンダリング）。

### 4.4 ナビゲーション

- ルート間の遷移は **`<Link href="...">`**（`next/link`）を使う。クライアントナビゲーション・プリフェッチの恩恵を受ける。
- プログラム的な遷移は **`useRouter()`**（Client Component 内）。フォーム送信後のリダイレクト等は Server Action 内で **`redirect()`** を使う。

---

## 5. フォーム・ミューテーション（Server Actions）

### 5.1 Server Actions を優先する

- フォーム送信・データ更新は **Server Actions** を優先する。`action` 属性に async 関数を渡す。
- API Route（`route.ts`）は、外部から呼ぶ API や Webhook など、HTTP インターフェースが必要な場合に使う。

```ts
// app/actions/books.ts
'use server';

export async function createBook(formData: FormData) {
  // バリデーション・DB 登録
  revalidatePath('/admin/books');
  redirect('/admin/books');
}
```

### 5.2 再検証

- データを変更したあと一覧などを最新にするには **`revalidatePath()`** または **`revalidateTag()`** を使う。
- エラー時は **メッセージを返して** クライアントで表示する（`useActionState` や `useFormStatus` と組み合わせ可）。

---

## 6. エラー・ローディング・404

- **error.tsx**: クライアントコンポーネントとして定義し、**error** と **reset** を受け取る。`reset()` で再試行できるようにする。
- **loading.tsx**: そのセグメントのローディング中に表示される。Suspense の fallback として使われる。
- **not-found.tsx**: `notFound()` を呼んだときや、存在しない動的ルートで表示。必要に応じて `not-found.tsx` を配置する。

---

## 7. メタデータ

- ルートの **metadata** は **layout.tsx** または **page.tsx** で **export const metadata** または **generateMetadata**（動的な場合）を使う。
- ルートレイアウトでは `title`, `description` 等を設定し、子セグメントで上書き可能にする。

```ts
export const metadata = {
  title: 'ちよプラブックスペース',
  description: '企業図書館向け貸出管理',
};
```

---

## 8. Middleware

- **認証チェック・リダイレクト** は **`middleware.ts`**（プロジェクトルート）で行う。未ログインなら `/login` へ、権限不足ならトップや 403 へ。
- Middleware は **Edge** で動く。重い処理や Node 専用 API は使わない。
- パスによって認証をスキップする（例: `/login`, `/register`, `_next`, 静的ファイル）ようにする。

---

## 9. 環境変数

- **サーバー専用**（API キー等）: プレフィックスなし。`process.env.SECRET_KEY`。
- **クライアントに渡す**（公開してよいもの）: **`NEXT_PUBLIC_`** プレフィックス。
- `.env.local` は git に含めない。`.env.example` で必要な変数名をドキュメントする。

---

## 10. セキュリティ

- **機密情報・パスワード・トークン** はサーバー側（Server Component / Server Action / API Route）でのみ扱う。
- ユーザー入力は **バリデーション** を必ず行う（サーバー側で実施）。権限チェック（役割）もサーバー側で行う。
- Supabase 等を使う場合、**RLS（Row Level Security）** やサービスロールの扱いを正しく設定する。

---

## 11. TypeScript

- **厳格な型付け** を心がける。`any` は避ける。
- 動的ルートの **params** は `Promise<{ id: string }>` 等で型付けする。Next.js の **PageProps** / **LayoutProps** ヘルパーが使える場合は利用する。
- プロジェクトルートに **`@/`** エイリアスがある場合は、`@/components/...`, `@/lib/...` でインポートする。

---

## 12. 本プロジェクトでの適用

- **認証**: Middleware で未ログインを `/login` へ。司書・管理者以外は `/admin/*`, `/reception/*` を拒否。
- **データ**: 蔵書・貸出・利用者・メール履歴は Supabase（PostgreSQL）から取得。取得は Server Component または Server Action 内で行う。
- **フォーム**: 蔵書登録・貸出・返却・返却依頼メール送信などは Server Actions で実装し、`revalidatePath` で一覧を更新する。
- **Client に出す範囲**: ログイン状態の表示、QR スキャン UI、検索フォームの入力・絞り込みなど、インタラクションが必要な部分だけ Client Component にする。

---

## 13. チェックリスト（実装時）

- [ ] 新規ページは Server Component で始め、必要最小限だけ `"use client"` を付けたコンポーネントに分割しているか
- [ ] データ取得はそのページまたはレイアウト内で行い、`params` / `searchParams` は await しているか
- [ ] フォーム・更新処理は Server Action で行い、`revalidatePath` でキャッシュを無効化しているか
- [ ] ルート間の遷移は `<Link>` を使っているか（通常の `<a>` は必要な場合のみ）
- [ ] エラー・ローディング・404 用に `error.tsx` / `loading.tsx` / `not-found.tsx` を必要なセグメントに置いているか
- [ ] 認証・権限チェックは Middleware および Server Action / API の両方で行っているか
- [ ] 環境変数はサーバー専用をクライアントに露出していないか

---

このドキュメントは開発の進行に合わせて見直し・追記する。
