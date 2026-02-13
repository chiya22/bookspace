# データモデル（たたき台）

要件定義に基づくエンティティ・テーブル設計のメモ。実装時は Supabase（PostgreSQL）のスキーマとして定義する。

**認証について**: Supabase Auth は利用しない。NextAuth（Credentials）のみで認証し、ユーザー情報はすべてこの Supabase の `users` テーブルで管理する。

---

## エンティティ概要

```
users (利用者・NextAuth で照合)
  ├── パスワードハッシュもこのテーブルに保持
  ├── 会員証QR用データ (qr_code_data)
  ├── 表示名 (display_name)。未設定時は name を表示に使用
  ├── 無効化フラグ (disabled)。true の場合はログイン不可
  ├── 1:N 貸出履歴 (loans)
  ├── N:M お気に入り (user_favorites)
  └── 1:N 書籍コメント (book_comments)

books (書籍・書誌)
  ├── 表紙画像は Supabase Storage、books.cover_image_path 等で参照
  ├── 1:N 貸出履歴 (loans)
  ├── N:M タグ (book_tags → tags)
  ├── N:M お気に入り (user_favorites)
  ├── 1:N 書籍コメント (book_comments)
  └── 1:N 棚卸チェック (inventory_checks)

loans (貸出レコード)
  └── user_id, book_id, lent_at, returned_at（返却時のみ）

tags (タグマスタ)
  └── N:M 書籍 (book_tags)

book_tags (書籍-タグ 中間テーブル)
  └── book_id, tag_id

user_favorites (利用者お気に入り)
  └── user_id, book_id。1利用者・1書籍の組み合わせで1レコード

email_logs (メール送信履歴)
  └── 送信のたびに1レコード。種別・宛先・送信日時等を記録

book_comments (書籍コメント)
  └── 利用者が書籍詳細で投稿。登録後の編集は不可

inventory_checks (棚卸・在庫チェック済み)
  └── book_id (PK), checked_at。クリア時は全件削除

inventory_clear_history (棚卸・クリア日時)
  └── 在庫チェック履歴をクリアした日時を記録。直近のクリア日時表示用
```

---

## テーブル案

### users（利用者）

NextAuth の Credentials 認証で照合するため、**ユーザー情報はすべてこのテーブルで管理**する。Supabase Auth は使わない。

| カラム（案） | 型 | 備考 |
|-------------|-----|------|
| id | UUID (PK) | 他テーブル・QRコード・NextAuth セッションで参照 |
| email | TEXT UNIQUE NOT NULL | ログイン用 |
| password_hash | TEXT NOT NULL | bcrypt 等でハッシュしたパスワード。NextAuth の authorize で照合。 |
| name | TEXT NOT NULL | 表示名・QRに含める |
| role | TEXT NOT NULL | 'user' / 'librarian' / 'admin' |
| qr_code_data | TEXT | QRに含めた文字列（例: JSON `{"userId":"...","name":"..."}`）または QR画像の Storage パス |
| display_name | TEXT | 表示名。未設定時は name を表示に使用。アカウント画面で編集可能 |
| disabled | BOOLEAN NOT NULL DEFAULT false | true の場合はログイン不可（無効化） |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

- **認証フロー**: ログイン時、NextAuth が `email` + 平文パスワードを受け取り、このテーブルで email を検索し、`password_hash` と照合する。
- **会員証QR**: 登録時に `id` と `name` から生成する文字列を `qr_code_data` に格納するか、画像を Storage に保存してパスを保持。

---

### books（書籍）

| カラム（案） | 型 | 備考 |
|-------------|-----|------|
| id | UUID (PK) | |
| title | TEXT NOT NULL | タイトル |
| author | TEXT NOT NULL | 著者 |
| publisher | TEXT NOT NULL | 出版社 |
| isbn | TEXT NOT NULL | ISBN（一意にするかは複本の有無による） |
| cover_image_path | TEXT | Supabase Storage のパス（任意） |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

- 複本（同一書誌で複数冊）を管理する場合は `book_copies` のような「所蔵資料」テーブルを別途検討し、`loans` は `book_copies` に紐づける。
- タグは `book_tags` 中間テーブルと `tags` マスタで多対多管理。

---

### tags（タグマスタ）

| カラム（案） | 型 | 備考 |
|-------------|-----|------|
| id | UUID (PK) | |
| name | TEXT NOT NULL UNIQUE | タグ名 |
| created_at | TIMESTAMPTZ | |

- 管理者がタグの追加・編集・削除を行う。書籍編集画面で書籍にタグを付与・解除する。

---

### book_tags（書籍-タグ 中間テーブル）

| カラム（案） | 型 | 備考 |
|-------------|-----|------|
| book_id | UUID NOT NULL (FK → books) | |
| tag_id | UUID NOT NULL (FK → tags) | |
| (book_id, tag_id) | PRIMARY KEY | |

- 1書籍に複数タグを付与可能。

---

### user_favorites（お気に入り）

| カラム（案） | 型 | 備考 |
|-------------|-----|------|
| user_id | UUID NOT NULL (FK → users) | |
| book_id | UUID NOT NULL (FK → books) | |
| created_at | TIMESTAMPTZ | |
| (user_id, book_id) | PRIMARY KEY | |

- 利用者が蔵書詳細画面でお気に入りに登録・解除。同一 (user_id, book_id) で1レコード。

---

### loans（貸出）

| カラム（案） | 型 | 備考 |
|-------------|-----|------|
| id | UUID (PK) | |
| user_id | UUID NOT NULL (FK → users) | 借りた利用者 |
| book_id | UUID NOT NULL (FK → books) | 貸し出した本 |
| lent_at | TIMESTAMPTZ NOT NULL | 貸出日時 |
| returned_at | TIMESTAMPTZ | NULL=貸出中、設定済み=返却済み |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

- **1人1冊**: 貸出登録時に「同一 user_id で returned_at IS NULL のレコードが既に1件ある場合は登録不可」という制約またはアプリ側チェック。
- **貸出日数**: `lent_at` から算出。返却済みの場合は `returned_at - lent_at` で計算可能。
- **貸出・返却履歴**: 上記の同じテーブルで履歴を参照する。返却済み（returned_at 設定済み）も含め、利用者ごとの履歴一覧や管理者向け全件一覧の取得に利用する。

---

## インデックス案

- `books`: `isbn`, `title`（検索用）
- `loans`: `user_id`, `book_id`, `returned_at`（貸出中一覧・返却登録時の照合）
- `tags`: `name`（検索・一覧用）
- `book_tags`: `book_id`, `tag_id`（書籍のタグ取得・タグ別一覧用）
- `user_favorites`: `user_id`, `book_id`（お気に入り判定・一覧用）

---

## 外部API・ストレージ

- **国会図書館API**: 書誌取得用。DB には書籍登録時に取得した結果を `books` に保存。
- **Supabase Storage**: 表紙画像用バケット。`books.cover_image_path` にパスを保存。アクセスはログイン済みユーザーのみとする。

---

## メール送信履歴（email_logs）

要件として **送信履歴を残す** ため、メール送信のたびにレコードを保存する。

| カラム（案） | 型 | 備考 |
|-------------|-----|------|
| id | UUID (PK) | |
| kind | TEXT NOT NULL | 種別: 'loan' / 'return' / 'return_request' 等 |
| recipient_user_id | UUID (FK → users) | 宛先利用者（任意。システム通知等の場合は NULL 可） |
| recipient_email | TEXT NOT NULL | 送信先メールアドレス |
| subject | TEXT | 件名（任意） |
| sent_at | TIMESTAMPTZ NOT NULL | 送信日時 |
| created_at | TIMESTAMPTZ | |

- 送信失敗時も「送信試行」として記録する場合は、`status`（'sent' / 'failed'）や `error_message` を追加するとよい。

---

## 書籍コメント（book_comments）

利用者が書籍詳細画面で投稿するコメント。登録後の編集は不可。

| カラム（案） | 型 | 備考 |
|-------------|-----|------|
| id | UUID (PK) | |
| book_id | UUID NOT NULL (FK → books) | |
| user_id | UUID NOT NULL (FK → users) | 投稿者 |
| body | TEXT NOT NULL | 本文 |
| created_at | TIMESTAMPTZ | |

---

## 棚卸・在庫チェック（inventory_checks）

棚卸で「在庫にある」とチェックした書籍を記録。在庫チェック履歴クリア時に全件削除する。

| カラム（案） | 型 | 備考 |
|-------------|-----|------|
| book_id | UUID (PK, FK → books) | チェック済みの書籍 |
| checked_at | TIMESTAMPTZ NOT NULL | チェック日時 |

---

## 棚卸・クリア履歴（inventory_clear_history）

在庫チェック履歴をクリアした日時を記録。画面上で「最後にクリアした日時」を表示するために使用。

| カラム（案） | 型 | 備考 |
|-------------|-----|------|
| id | UUID (PK) | |
| cleared_at | TIMESTAMPTZ NOT NULL | クリア実行日時 |

---

実装時に RLS（Row Level Security）やトリガー（updated_at 自動更新等）も合わせて定義すること。
