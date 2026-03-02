# Supabase アラート: RLS 未有効テーブル

## アラートの内容

**「Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST」**

PostgREST に公開されているスキーマ（通常は `public`）のうち、**Row Level Security（RLS）が有効になっていないテーブル**を検知したときに表示されます。

---

## エラー内容の説明

### RLS（Row Level Security）とは

- PostgreSQL の機能で、**テーブル単位で「どの行を誰が読む・書けるか」を制御**します。
- RLS を有効にすると、**ポリシーで許可した操作だけ**が実行されます。ポリシーがなければそのテーブルにはアクセスできません。

### なぜこのアラートが出るか

- Supabase の API（PostgREST）は、`public` スキーマなどのテーブルを **anon key（匿名）や authenticated key（認証済み）** からも叩けるようにしています。
- **RLS がオフのテーブル**は、anon/authenticated で接続した場合でも **全行の読み書きができてしまう**可能性があります。
- そのため Supabase は「RLS を有効にしていないテーブルがある」ことをセキュリティ上の注意としてアラートで知らせています。

### このプロジェクトの現状

| テーブル例 | RLS |
|-----------|-----|
| `users` | ✅ 有効（マイグレーション 00010） |
| `books`, `loans`, `tags`, `book_tags` などその他 | ❌ 未有効 |

- アプリは **サーバー側のみ** で Supabase を使っており、**サービスロールキー**（`SUPABASE_SERVICE_ROLE_KEY`）で接続しています。
- **サービスロールは RLS をバイパス**するため、現状の「RLS が users だけ」でも、アプリの動作には問題ありません。
- 一方で、**anon key や authenticated key がどこかから漏れた場合**、RLS のないテーブル（books など）にはそのキーで直接アクセスされてしまうリスクがあります。アラートはそのリスクを指摘しています。

---

## 対処方法

### 方針の選択

1. **アラートを解消しつつセキュリティを上げる（推奨）**  
   → すべてのテーブルで RLS を有効にし、「anon/authenticated では一切アクセスさせない」ポリシーを付ける。
2. **現状のまま運用する**  
   → サーバーだけがサービスロールで接続する前提であれば動作は問題ないが、アラートは残り、anon/authenticated の誤利用時のリスクは残る。

以下は **1 の「RLS を有効にしてアラート解消」** の手順です。

### 手順概要

1. **対象テーブルを把握する**  
   PostgREST に公開されているスキーマ（通常は `public`）の全テーブルを確認する。
2. **RLS を有効にする**  
   各テーブルで `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` を実行する。
3. **ポリシーを決める**  
   - **サービスロールのみ使う場合**  
     anon/authenticated 用のポリシーは **一切作らない**。  
     → サービスロールだけが RLS をバイパスして全アクセス可能、anon/authenticated は全テーブルで 0 件になる。
   - **将来的に anon/authenticated も使う場合**  
     「ロールごと・テーブルごとに許可する操作」だけを許可するポリシーを追加する。

### マイグレーション例（サービスロールのみ使う場合）

`users` 以外のテーブルにも RLS を有効にするだけなら、例えば次のようなマイグレーションを追加します。

```sql
-- RLS を有効化するだけ。ポリシーは追加しない。
-- サービスロールは RLS をバイパスするため、アプリの動作は変わらない。
-- anon / authenticated ではどの行も見えず・操作できない（セキュリティ向上）。

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_clear_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;
-- 他に public に作成したテーブルがあれば同様に ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
```

- **ポリシーを追加しない**  
  → anon/authenticated では SELECT/INSERT/UPDATE/DELETE いずれも 0 件のみ（事実上アクセス不可）。
- **サービスロール**  
  → 従来どおり RLS をバイパスするため、既存のアプリコードの変更は不要です。

### 注意点

- 既存の `users` テーブルはすでに RLS 有効のため、上記には含めなくてよいです。
- 本番適用前に、**ローカルやステージングでマイグレーションを実行し、アプリの動作が変わらないことを確認**してください。
- 将来「匿名ユーザーに books の一覧だけ見せる」などする場合は、そのテーブルに **許可する操作だけ** を定義したポリシーを追加する形で対応します。

---

## まとめ

| 項目 | 説明 |
|------|------|
| **アラートの意味** | PostgREST に公開されているテーブルのうち、RLS がオフのテーブルがあると出る注意 |
| **リスク** | anon/authenticated キーで、RLS のないテーブルに直接アクセスされる可能性がある |
| **対処** | 対象テーブルで RLS を有効にし、サービスロールのみ使う場合はポリシーなしでよい（anon/authenticated は全拒否） |
| **このアプリ** | サーバーはサービスロールのみ使用のため、RLS を有効にしても既存の挙動は変わらない |
