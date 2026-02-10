# Supabase セットアップ手順

フェーズ1で行う Supabase の初期設定。実施後、`.env.local` に環境変数を設定する。

---

## 1. プロジェクト作成

1. [Supabase](https://supabase.com/dashboard) にログインする。
2. **New project** でプロジェクトを作成する（リージョン・パスワードを設定）。
3. プロジェクトが起動したら、**Settings** → **API** で以下を控える：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - （必要に応じて）**service_role** キー → `SUPABASE_SERVICE_ROLE_KEY`（サーバー側のみ・秘密）

---

## 2. データベースマイグレーション（テーブル作成）

1. ダッシュボードで **SQL Editor** を開く。
2. **New query** で、プロジェクト内の `supabase/migrations/00001_initial_schema.sql` の内容をすべてコピーして貼り付ける。
3. **Run** で実行する。`users`, `books`, `loans`, `email_logs` テーブルとインデックス・トリガーが作成される。

※ 本プロジェクトでは Supabase CLI は利用しない。マイグレーションの追加・変更は、都度 SQL を用意し SQL Editor で実行する。

---

## 3. Storage バケット作成（表紙画像用）

1. ダッシュボードで **Storage** を開く。
2. **New bucket** をクリックする。
3. 次のように設定する：
   - **Name**: `book-covers`
   - **Public bucket**: **オフ**（private のまま。要件どおり「ログイン必須」のため）
4. **Create bucket** で作成する。
5. 作成したバケットの **Policies** で、次を追加する（アプリが anon key でアップロード・参照するため）：
   - **INSERT**（upload）を許可するポリシー（例: `role = 'anon'` または `true` で全許可。本番では必要に応じて制限する）。
   - **SELECT**（読み取り）を許可するポリシー（署名付きURL発行に必要）。

表紙画像の参照は、**Server 経由で署名付きURLを発行**する実装で行う（ログイン済みユーザーのみにURLを返す）。

---

## 4. 環境変数

プロジェクトルートに `.env.local` を作成し、`.env.example` をコピーして値を埋める。

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...  # ランダムな文字列（例: openssl rand -base64 32）
```

`npm run dev` でアプリを起動し、Supabase に接続できることを確認する。

---

## 5. RLS（Row Level Security）

初期スキーマでは RLS を有効にしていない。アプリ側で NextAuth のセッションを確認し、認証済みユーザーのみが API 経由でデータを読む前提とする。  
のちに「Supabase の anon key だけではどのレコードも読めないようにする」運用にする場合は、RLS を有効にしてポリシーを追加する（その際はサーバー側で `SUPABASE_SERVICE_ROLE_KEY` を使うか、JWT を渡す方式を検討する）。
