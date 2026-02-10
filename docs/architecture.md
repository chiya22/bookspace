# アーキテクチャ・開発方針

要件定義と技術スタックに基づく、開発時の技術方針・ディレクトリ構成・注意事項のメモ。

**Next.js App Router**: 実装時は [Next.js App Router ベストプラクティス](./nextjs-app-router-practices.md) に準拠して開発する。

---

## 技術スタック

| 項目 | 技術 | 備考 |
|------|------|------|
| フレームワーク | Next.js (App Router) | 既存プロジェクトを継続利用 |
| DB | Supabase (PostgreSQL) | **認証には使わない**。アプリ用テーブル（users, books, loans 等）のみ。 |
| 認証 | NextAuth のみ | Credentials（メール+パスワード）。**Supabase Auth は利用しない**。 |
| ストレージ | Supabase Storage | 表紙画像のみ。認証は NextAuth が担当。 |
| 書誌取得 | 国会図書館API | 外部連携 |
| メール送信 | 要選定 | Resend / SendGrid / SMTP 等 |

---

## 認証方針（NextAuth のみ・Supabase Auth は使わない）

- **認証は NextAuth のみ**で行う。Supabase Auth は利用しない。シンプルに Supabase のデータベースに `users` テーブルを用意し、そこでユーザー情報（メール・名前・役割・パスワードハッシュ・会員証QR用データ等）を管理する。
- **ログイン時**: NextAuth の Credentials プロバイダで、入力されたメール・パスワードを Supabase の `users` テーブルに照合する（パスワードは bcrypt 等でハッシュしてテーブルに格納）。照合成功時にセッションを発行する。
- **役割**: `user`（一般）, `librarian`（司書・管理者）, `admin`（システム管理者）を `users.role` に持たせる。
- **無効化**: `users.disabled` が true の利用者はログイン不可（authorize で弾く）。
- NextAuth のセッションに `role` と `userId`（Supabase の users.id）を含め、ミドルウェアまたは Server Component で「受付・管理画面は librarian / admin のみ」を判定する。
- 会員証QRコードは「ユーザーID（と名前）」で利用者を一意に特定できる形式にする。受付画面でスキャンしたQRからユーザーIDを取得し、貸出・返却APIに渡す。

---

## ディレクトリ構成（案）

```
app/
  (auth)/           # 認証まわり（レイアウトで未ログイン時表示）
    login/
    register/
  (main)/           # ログイン後のメイン（一般・司書・管理者共通で見る画面）
    layout.tsx      # 共通レイアウト・ナビ
    page.tsx        # トップ（QR + 貸出中一覧）
    books/          # 蔵書一覧・詳細
    account/        # ユーザー情報・QR表示
  (admin)/          # 受付・管理（司書・管理者以上）
    layout.tsx      # 管理者用レイアウト・権限チェック
    reception/      # 貸出・返却処理
    admin/          # 蔵書管理・タグ管理・利用者管理・棚卸
  api/              # Route Handlers（必要に応じて）
  layout.tsx
  globals.css

lib/
  supabase/         # Supabase クライアント・サーバー用
  auth/             # NextAuth 設定・ヘルパー
  qr/               # QR生成
  mail/             # メール送信
  ndl/              # 国会図書館API クライアント（任意）

components/
  ui/               # 共通UI
  books/            # 書籍関連
  reception/        # 受付画面用（ISBN入力・QRスキャン等）
```

- App Router の Route Groups `(auth)`, `(main)`, `(admin)` で「未ログイン」「一般」「管理者」ごとのレイアウトと権限を分離する。
- 受付者用の「会員証QRスキャン」は、ブラウザのカメラAPI（または外部スキャナの入力）でQRを読み取り、そのデータを貸出・返却APIに送る形を想定。

---

## 環境変数（例）

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # サーバー側のみ、必要なら

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# メール（使用するサービスに合わせて）
MAIL_* または RESEND_API_KEY 等
```

---

## セキュリティ・アクセス制御

- **全画面**: 未ログインはログイン画面へリダイレクト（ミドルウェアで実施）。
- **受付・管理画面**: `role === 'librarian' || role === 'admin'` 以外は 403 またはトップへリダイレクト。
- **API**: 同様にセッションと role を確認し、貸出・返却・蔵書登録・削除・利用者管理は権限ありのみ許可。
- **Supabase Storage**: 表紙画像は「認証済みユーザーのみ閲覧可」のポリシーにする。
- **RLS**: Supabase の Row Level Security を有効にし、サービスロールまたは認証済みユーザーのみ適切にアクセスできるようにする。

---

## 開発時の注意

- 日本語のみ対応。メッセージ・ラベルは日本語で統一。
- 日付・日数表示は日本時間（JST）で統一するか、タイムゾーンを明示する。
- 貸出「1人1冊」は、貸出登録API内で「該当ユーザーの貸出中レコードが0件であること」をチェックしてから登録する。
- 返却登録時は「該当 user_id + book_id（または ISBN から特定した book_id）で returned_at が NULL のレコードが1件あること」を確認し、そのレコードの `returned_at` を更新する。

---

## 参照

- **開発規約**: [Next.js App Router ベストプラクティス](./nextjs-app-router-practices.md)（必ず準拠すること）
- 要件: [Requirements.md](../Requirements.md)
- タスク: [task-progress.md](./task-progress.md)
- 画面: [screens.md](./screens.md)
- データ: [data-model.md](./data-model.md)
