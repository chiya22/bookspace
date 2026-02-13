# タスク進捗管理表

要件定義（Requirements.md）に基づく開発タスクの一覧。進捗は随時更新する。

**凡例**
- **状態**: 未着手 / 進行中 / 完了 / 保留
- **優先度**: 高 / 中 / 低
- **フェーズ**: 1=基盤, 2=認証・利用者, 3=蔵書, 4=貸出・返却, 5=管理・通知

---

## フェーズ1: 基盤・環境

| No | タスク | 状態 | 優先度 | フェーズ | 備考 |
|----|--------|------|--------|---------|------|
| 1.1 | Next.js App Router プロジェクト確認・必要パッケージ追加 | 完了 | 高 | 1 | @supabase/supabase-js, next-auth, bcryptjs, qrcode 追加済み |
| 1.2 | Supabase プロジェクト作成・環境変数設定 | 完了 | 高 | 1 | .env.example と lib/supabase 作成。要: ダッシュボードでプロジェクト作成し .env.local に設定 |
| 1.3 | Supabase DB マイグレーション基盤（初期テーブル作成） | 完了 | 高 | 1 | supabase/migrations/00001_initial_schema.sql。docs/supabase-setup.md 参照 |
| 1.4 | Supabase Storage バケット作成（表紙画像用） | 完了 | 中 | 1 | docs/supabase-setup.md に手順記載。バケット名 book-covers（private） |

---

## フェーズ2: 認証・利用者

| No | タスク | 状態 | 優先度 | フェーズ | 備考 |
|----|--------|------|--------|---------|------|
| 2.1 | NextAuth 導入（Credentials: メール+パスワード）。Supabase Auth は使わず、users テーブルで照合 | 完了 | 高 | 2 | lib/auth/options.ts, api/auth/[...nextauth] |
| 2.2 | 会員登録画面・API（メール・パスワード・名前等） | 完了 | 高 | 2 | (auth)/register, RegisterForm, registerUser Server Action |
| 2.3 | 会員証QRコード生成・データ格納（登録時） | 完了 | 高 | 2 | buildQrCodeData, 登録後に users.qr_code_data 更新 |
| 2.4 | ログイン後のトップ画面（利用者: QR + 貸出中一覧） | 完了 | 高 | 2 | (main)/page.tsx, 貸出日数表示 |
| 2.5 | ユーザー情報画面（QR表示・自分の情報） | 完了 | 中 | 2 | (main)/account/page.tsx |
| 2.6 | 役割（一般/司書/システム管理者）の管理・ミドルウェア | 完了 | 高 | 2 | middleware.ts, (main)/reception|admin layout で権限チェック |

---

## フェーズ3: 蔵書・カタログ

| No | タスク | 状態 | 優先度 | フェーズ | 備考 |
|----|--------|------|--------|---------|------|
| 3.1 | 書籍テーブル・CRUD API（登録・削除は管理者のみ） | 完了 | 高 | 3 | lib/actions/books.ts。登録・更新・削除、redirect |
| 3.2 | 表紙画像アップロード・表示（Supabase Storage） | 完了 | 中 | 3 | 登録・編集でアップロード。一覧・詳細で署名付きURL表示 |
| 3.3 | 蔵書検索（タイトル・著者・出版社・ISBN あいまい） | 完了 | 高 | 3 | lib/books/queries.ts searchBooks。.or(ilike) |
| 3.4 | 蔵書一覧・詳細画面（利用者・管理者とも参照可） | 完了 | 高 | 3 | /books, /books/[id]。BookSearchForm, 表紙表示 |
| 3.5 | 国会図書館API 連携（書誌取得・補完） | 完了 | 中 | 3 | lib/ndl/client.ts, api/ndl/lookup, NdlLookup ボタン |

---

## フェーズ4: 貸出・返却

| No | タスク | 状態 | 優先度 | フェーズ | 備考 |
|----|--------|------|--------|---------|------|
| 4.1 | 貸出テーブル・貸出登録API（受付者用） | 完了 | 高 | 4 | lib/actions/loans.ts registerLoan。ISBN+利用者ID、1人1冊制約 |
| 4.2 | 返却登録API（受付者用） | 完了 | 高 | 4 | lib/actions/loans.ts registerReturn。ISBN+利用者IDで該当貸出を終了 |
| 4.3 | 受付者用 貸出処理画面（ISBN入力・会員証QRスキャン） | 完了 | 高 | 4 | /reception/loan。受付者・管理者アクセス可。LoanReturnForm |
| 4.4 | 受付者用 返却処理画面（ISBN入力・会員証QRスキャン） | 完了 | 高 | 4 | /reception/return。LoanReturnForm で統合 |
| 4.5 | 貸出日数の計算・一覧・詳細での表示 | 完了 | 高 | 4 | トップで「貸出日・○日目」表示済み |
| 4.6 | 利用者トップでの「現在貸出中書籍一覧」表示 | 完了 | 高 | 4 | フェーズ2で実装済み。(main)/page.tsx |
| 4.7 | 利用者の貸出・返却履歴画面（自分の履歴） | 完了 | 高 | 4 | /loans。getLoansByUserId、貸出日・返却日・貸出日数表示 |
| 4.8 | 司書・管理者の貸出・返却履歴一覧（全件） | 完了 | 高 | 4 | /reception/loans。getAllLoans、貸出中/返却済みフィルタ |

---

## フェーズ5: 管理・通知

| No | タスク | 状態 | 優先度 | フェーズ | 備考 |
|----|--------|------|--------|---------|------|
| 5.1 | 利用者管理画面（一覧・編集・無効化等） | 完了 | 高 | 5 | /admin/users, /admin/users/[id]/edit。無効化は users.disabled |
| 5.2 | 蔵書の棚卸機能（在庫チェック・クリア・未チェック一覧） | 完了 | 中 | 5 | /admin/inventory。在庫チェック履歴のクリア、ISBNでチェック、未チェック一覧・最終クリア日時表示。ページング対応 |
| 5.3 | 貸出時・返却時のメール送信 | 完了 | 高 | 5 | lib/mail/send, registerLoan/registerReturn から送信・email_logs 記録 |
| 5.4 | 管理者による返却依頼メール送信 | 完了 | 高 | 5 | 貸出履歴一覧（/reception/loans）から貸出1件ごとに送信。メール本文に書籍（タイトル・著者）・貸出日・貸出日数を含む |
| 5.5 | メール送信基盤（Resend / SendGrid / SMTP 等） | 完了 | 高 | 5 | Resend。RESEND_API_KEY, MAIL_FROM で設定 |
| 5.6 | メール送信履歴テーブル・保存処理（email_logs） | 完了 | 高 | 5 | sendEmailAndLog で送信成功時に email_logs に INSERT |

---

## フェーズ6: その他・品質

| No | タスク | 状態 | 優先度 | フェーズ | 備考 |
|----|--------|------|--------|---------|------|
| 6.1 | 未ログイン時は全画面参照不可（リダイレクト） | 完了 | 高 | 6 | middleware.ts で /login・/register 以外はトークンなし時 /login へリダイレクト。 (main)/layout でも二重チェック |
| 6.2 | エラーハンドリング・メッセージ統一 | 完了 | 中 | 6 | lib/messages.ts で日本語メッセージを定数化。tags・favorites の Server Action で利用。他アクションも順次参照可 |
| 6.3 | レスポンシブ・アクセシビリティの最低限対応 | 完了 | 低 | 6 | スキップリンク（#main）、main に id/main、nav に aria-label、ログアウトに aria-label。既存の sm: 等でレスポンシブ対応済み |

---

## 進捗サマリ

| フェーズ | 合計 | 完了 | 進行中 | 未着手 |
|----------|------|------|--------|--------|
| 1 | 4 | 4 | 0 | 0 |
| 2 | 6 | 6 | 0 | 0 |
| 3 | 5 | 5 | 0 | 0 |
| 4 | 8 | 8 | 0 | 0 |
| 5 | 6 | 6 | 0 | 0 |
| 6 | 3 | 3 | 0 | 0 |
| **計** | **32** | **32** | **0** | **0** |

※ タスク完了時に「状態」を「完了」に更新し、上記サマリも手動で更新すること。
