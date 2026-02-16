# ウェブ公開ガイド（デプロイ手順）

このアプリをインターネットに公開するためのおすすめ方法と手順です。

---

## おすすめ: Vercel で公開

**Vercel** は Next.js の開発元が提供するホスティングで、次の理由から最もおすすめです。

- Next.js に最適化されており、設定が少なくすぐ公開できる
- 無料プランで個人・小規模運用が可能
- GitHub と連携すると、プッシュするだけで自動デプロイ（プレビュー付き）
- 環境変数をダッシュボードで簡単に設定できる
- Supabase・Resend との相性が良い

---

## 前提条件

1. **GitHub にリポジトリがあること**  
   まだの場合は `git init` して GitHub にプッシュしてください。

2. **Supabase プロジェクトが本番用に用意されていること**  
   開発用と本番用でプロジェクトを分けることを推奨します。  
   [Supabase Dashboard](https://supabase.com/dashboard) でプロジェクトを作成し、マイグレーションを適用しておいてください。

3. **本番用の環境変数**  
   以下をあらかじめメモしておくとスムーズです。

---

## 手順 1: Vercel にプロジェクトをデプロイする

### 1-1. Vercel にサインアップ・ログイン

1. [vercel.com](https://vercel.com) にアクセス
2. **Sign Up** から **Continue with GitHub** で GitHub アカウントと連携

### 1-2. 新規プロジェクトのインポート

1. ダッシュボードで **Add New…** → **Project**
2. **Import Git Repository** でこのリポジトリ（bookspace）を選択
3. **Framework Preset** は **Next.js** のまま
4. **Root Directory** は空欄のままで OK（リポジトリ直下が Next.js プロジェクトの場合）
5. いったん **Deploy** は押さず、**Environment Variables** を先に設定（次の手順）

---

## 手順 2: 環境変数を設定する

Vercel のプロジェクト画面で **Settings** → **Environment Variables** を開き、次の変数を追加します。

| 変数名 | 値 | 備考 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase の Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 匿名キー | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | サービスロールキー | 同上（**秘密**。クライアントに露出しない） |
| `NEXTAUTH_URL` | **本番の URL**（後述） | 例: `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | ランダムな長い文字列 | [generate-secret.vercel.app](https://generate-secret.vercel.app/) 等で生成 |
| `RESEND_API_KEY` | Resend の API キー | [Resend](https://resend.com/api-keys) で取得（メール送信に必要） |
| `MAIL_FROM` | 送信元メール | 例: `ちよプラブックスペース <noreply@yourdomain.com>`（Resend で検証済みドメイン推奨） |

- **Environment** は **Production**（と必要なら Preview）にチェックを付けて保存してください。
- 初回デプロイ時は `NEXTAUTH_URL` を仮で `https://your-app.vercel.app` にしておき、デプロイ後に表示される実際の URL に差し替えて再デプロイしても構いません。

---

## 手順 3: デプロイを実行する

1. 環境変数を保存したあと、**Deploy** をクリック
2. ビルドが完了すると、**https://プロジェクト名.vercel.app** のような URL で公開されます
3. 表示された URL を `NEXTAUTH_URL` に設定している場合は、**Redeploy** で再デプロイしてください

---

## 手順 4: 本番 Supabase の準備

- 開発環境で使っている **マイグレーション** を本番 Supabase に適用します。  
  Supabase CLI を使う場合の例:

  ```bash
  supabase link --project-ref 本番プロジェクトの ref
  supabase db push
  ```

- Storage を使っている場合は、本番プロジェクトで **Storage** のバケット（例: `book-covers`）を作成し、必要に応じてポリシーを設定してください。

---

## 手順 5: 動作確認

1. 本番 URL にアクセスしてログイン・会員登録ができるか確認
2. 蔵書一覧・貸出・返却・メール送信など、主要な機能を一通り確認
3. 問題があれば Vercel の **Deployments** のログや **Functions** のログでエラーを確認

---

## カスタムドメインを使う場合（任意）

1. Vercel のプロジェクトで **Settings** → **Domains** を開く
2. 使いたいドメイン（例: `books.example.com`）を追加
3. 表示される CNAME や A レコードを、ドメイン管理の DNS に設定
4. 反映後、**NEXTAUTH_URL** を `https://books.example.com` に変更して再デプロイ

---

## その他のホスティング

- **Netlify**: Next.js 対応。Vercel と同様に GitHub 連携でデプロイ可能。環境変数の設定手順が少し異なります。
- **Railway / Render**: フルスタック向け。`next start` で動かす形になり、ビルドコマンド・起動コマンドを自分で指定します。
- **自前サーバー**: `next build` のあと `next start`（または PM2 等で常時起動）で動作します。Reverse Proxy（nginx 等）で HTTPS とドメインを設定してください。

---

## 動作を軽くする工夫（実施済み・追加でできること）

次の対策をコードに取り込んであります。

- **表紙の署名付きURLをキャッシュ**  
  同じ表紙を短時間で再度表示するときに、Supabase への問い合わせを減らしています。
- **トップページの並列取得**  
  ユーザー情報・貸出一覧・表紙URL・QRコードを並列で取得し、待ち時間を短くしています。
- **Next.js の最適化**  
  `optimizePackageImports` で Supabase クライアントのバンドルを削減しています。

追加で検討できること:

- **Vercel のリージョン**  
  利用者に近いリージョンを選ぶとレイテンシが改善します（Vercel のプロジェクト設定で変更可能）。
- **有料プラン**  
  無料プランはコールドスタートが発生しやすいため、常時起動に近い有料プランにすると体感が軽くなることがあります。

---

## トラブルシューティング

| 現象 | 確認すること |
|------|----------------|
| ログインできない | `NEXTAUTH_URL` が本番 URL と一致しているか、`NEXTAUTH_SECRET` が設定されているか |
| データが表示されない | `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` が本番 Supabase の値か、本番 DB にマイグレーションが適用されているか |
| メールが届かない | `RESEND_API_KEY` と `MAIL_FROM` が設定されているか、Resend の送信元ドメインが検証済みか |
| ビルドエラー | ローカルで `npm run build` が通るか。Vercel のビルドログでエラー行を確認 |

---

## まとめ

1. **Vercel** に GitHub リポジトリをインポート
2. **環境変数**（Supabase / NextAuth / Resend）をすべて設定
3. **デプロイ**後、本番 URL を `NEXTAUTH_URL` に設定して必要なら再デプロイ
4. **本番 Supabase** にマイグレーションと Storage を準備
5. 本番 URL で**動作確認**

これでアプリをウェブに公開できます。
