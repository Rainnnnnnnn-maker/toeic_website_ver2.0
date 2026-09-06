# マイページ復習導線 セットアップ手順（ログイン必須機能）

> 対象: `/mypage`（お気に入り単語の復習スケジュール）
> 作成日: 2026-08-27
> 前提: `phase1-login-favorites-sync-setup.md` の Supabase Phase 1（Google ログインと `favorites` テーブル）が動いていること
> ※ マイグレーション自体は単体で完結しており、Phase 1 の SQL の適用状況には依存しない

## 0. このドキュメントの目的

`/mypage` と `/review?queue=due` は **ログイン必須** の機能で、Supabase に新しいテーブルを 2 つ必要とする。
このファイルは「コードを取り込んだあと、本番/ローカルで動かすために人が手を動かす作業」をまとめたもの。

---

## 1. 事前チェック（ログイン必須機能の前提）

ログインが通らない環境ではこの機能は一切使えない。着手前に確認する。

- [ ] Supabase → **Authentication → Sign In / Providers → Google** が有効（クライアント ID / シークレット設定済み）
- [ ] Supabase → **Authentication → URL Configuration**
  - Site URL: `https://www.toeic-words.com`
  - Redirect URLs: `http://localhost:3000/**` / `https://www.toeic-words.com/**` / プレビュー用 URL
- [ ] Supabase プロジェクトが pause していない（Free プランは約 1 週間の無操作で一時停止する）
- [ ] `.env.local` と Vercel に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` が設定済み

> `phase1-login-favorites-sync-setup.md` §4 の記録欄では Google OAuth クライアント作成が「未」のままになっている。
> 記録が古いだけの可能性もあるが、**実際にログインできるかを必ず実機で確認する**こと。

---

## 2. DB マイグレーション（必須・手動実行）

適用する SQL は **リポジトリで管理**している。

```
supabase/migrations/20260827000000_word_review_progress.sql
```

このファイルは **単体で完結**していて（`handle_updated_at()` も自前で作る）、**何度実行しても同じ結果になる**（`if not exists` / `drop ... if exists` / `create or replace`）。
途中でエラーになった場合も、原因を直してそのまま丸ごと再実行してよい。

### 方法A: Supabase ダッシュボードの SQL Editor（推奨）

追加ツール不要で、権限も `postgres` ロールなので確実。

1. https://supabase.com/dashboard → プロジェクト `toeic-words` → 左メニュー **SQL Editor**
2. **New query** を開く
3. `supabase/migrations/20260827000000_word_review_progress.sql` の**全文**を貼り付ける（分割して貼らない）
4. **Run**（⌘/Ctrl + Enter）

> SQL Editor は 1 回の Run を 1 トランザクションで実行する。
> 途中の 1 文でも失敗すると**全部ロールバックされて何も作られない**ため、
> 「途中まで作られた」状態を心配せず、エラーを直して再実行すればよい。

### 方法B: Supabase CLI（`npx supabase db push`）

CLI は devDependency に入っているので `npx supabase` で使える（グローバルインストール不要）。
**リモートに当てるだけなら Docker は不要。**

```bash
npx supabase db push
```

- 初回は DB パスワードを聞かれる（Dashboard → **Settings → Database** で確認 / リセットできる）
- リンクが切れている場合は `npx supabase link --project-ref jwxnlfaptawesijvjjwt` を先に実行
- 適用状況は `npx supabase migration list --linked` で確認できる

> ⚠️ このプロジェクトは Phase 1 の `profiles` / `favorites` を **SQL Editor で手作業で作った**ため、
> ローカルの `supabase/migrations/` にはそのベースラインが存在しない。
> `supabase db reset` / `supabase db diff` は「ローカル migrations だけの DB」を前提に動くので、
> **リモートに対して使わないこと**（Phase 1 のテーブルが無い前提の差分が出る）。
> リモートへ当てるのは `db push` だけにする。

### 作成されるもの

| テーブル | 役割 | 主なカラム |
| --- | --- | --- |
| `word_review_progress` | お気に入り単語ごとの復習進捗 | `box`(0-5) / `review_count` / `forgot_count` / `last_reviewed_at` / `next_review_at` |
| `learning_streaks` | 連続学習日数（1 ユーザー 1 行） | `last_study_date`(JST) / `current_streak` / `best_streak` |

- RLS ポリシーは `favorites` と同じく「自分の行のみ全操作可」（`auth.uid() = user_id`）
- `authenticated` ロールへの GRANT も含む。新しめの Supabase プロジェクトでは public スキーマの新規テーブルが Data API に自動公開されず、RLS があっても GRANT が無いと `42501 permission denied` になるため
- `updated_at` トリガー用の `public.handle_updated_at()` はこのファイル内で `create or replace` する（Phase 1 の適用状況に依存しない）
- Supabase Postgres 17 イメージ上で「新規DB」「Phase 1 適用済みDB」「2回連続実行」の3パターンを実行し、RLS の他ユーザー不可視・他人の `user_id` での insert 拒否・`on conflict (user_id, word_slug)` の upsert・`updated_at` トリガー発火まで確認済み（2026-08-28）

### 適用できたかの確認

SQL Editor で以下を実行する。**3 行**返れば成功。

```sql
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname) as policies,
  has_table_privilege('authenticated', c.oid, 'select') as authenticated_can_select
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('word_review_progress', 'learning_streaks', 'favorites')
order by c.relname;
```

期待値: `word_review_progress` / `learning_streaks` の両方が `rls_enabled = true`、`policies >= 1`、`authenticated_can_select = true`。

### よくあるエラーと対処

| エラーメッセージ | 原因 | 対処 |
| --- | --- | --- |
| `function public.handle_updated_at() does not exist`（42883） | Phase 1 の SQL 未適用（旧版の migration を実行した） | 現行版はこの関数を自前で作る。ファイルを最新にして再実行 |
| `relation "word_review_progress" already exists` / `policy ... already exists` | 途中まで適用済み（旧版は再実行に対応していなかった） | 現行版は冪等なのでそのまま再実行してよい |
| `permission denied for schema auth` / `must be owner of table users` | アプリ用のロールや接続文字列で実行した | ダッシュボードの **SQL Editor**（`postgres` ロール）で実行する |
| `42501 permission denied for table word_review_progress`（アプリ実行時） | Data API 向けの GRANT が無い | 現行版の GRANT 文を実行（ファイル末尾） |
| `PGRST205 Could not find the table 'public.word_review_progress' in the schema cache`（アプリ実行時） | PostgREST のスキーマキャッシュが古い | 通常は自動更新される。残る場合は SQL Editor で `notify pgrst, 'reload schema';` を実行するか、Dashboard から API を再読み込み |
| CLI: `Cannot connect to the Docker daemon` | `supabase db reset` / `db diff` などローカル DB が必要なコマンドを実行した | リモートに当てるのは `npx supabase db push`。Docker は不要 |
| CLI: パスワードを聞かれる / `failed SASL auth` | DB パスワード未設定・不明 | Dashboard → Settings → Database でリセットして再実行 |
| CLI: `Remote migration versions not found in local migrations directory` | リモートの履歴とローカルのファイルが不一致 | `npx supabase migration list --linked` で差分を確認し、`npx supabase migration repair --status reverted <version>` で整合させる |
| CLI: `supabase_migrations.schema_migrations does not exist` | 履歴テーブル未作成（手作業運用のため） | `db push` が自動作成する。失敗する場合は方法A（SQL Editor）で当てて構わない |

> 方法A（SQL Editor）で適用した場合、CLI の履歴テーブルには記録されない。
> 以後 CLI を使うなら `npx supabase migration repair --status applied 20260827000000` で
> 「適用済み」として記録しておくと、次回以降の `db push` が重複実行しない。

## 3. 動作確認（手動スモークテスト）

`npm run dev` で確認する。**アカウントは 2 つ用意**すると混入チェックまでできる。

### ゲスト（未ログイン）

- [ ] `/mypage` を直接開く → ログインゲートが表示される（無料機能へのリンクも出る）
- [ ] TOP と `/favorites` に「マイページ」ボタンが**表示されない**
- [ ] `/review`（パラメータなし）が従来どおり動く
- [ ] `/review?queue=due` → ブロックされず、お気に入り全件 + ログイン案内バーで開始する

### ログイン済み

- [ ] ログインゲート → Google ログイン → **`/mypage` に戻ってくる**（`?next=/mypage`）
- [ ] ゲスト中に付けた星が、初回ログイン時のマージで Supabase に入り、マイページの母数に反映される
- [ ] 星が 0 件のとき、ヒーローカードが「今日の6単語から始める」空状態になる
- [ ] 星を付ける → `/mypage` の「今日の復習」に件数が出る
- [ ] 「復習をはじめる」→ 採点 → マイページに戻ると件数・連続日数・定着度が変わる
- [ ] 期限到来が11語以上ある状態でも「今日の復習」は開始時の最大10語だけで完了し、途中で11語目が補充されない
- [ ] 「覚えていない」で単語詳細に飛んだケースでも記録が残っている（Table Editor で `forgot_count` を確認）
- [ ] `due` / `weak` から「覚えていない」→単語詳細→戻る、で元の `?queue=` が維持される。苦手単語パネルから詳細を開いた場合はマイページへ戻る
- [ ] 「今日の復習」を消化しきると完了表示になり、次回予定日が出る
- [ ] `/review?queue=weak` が「覚えていない」と答えた単語だけを出題する（0 件なら全件へフォールバック）

### 同期・アカウント

- [ ] **別ブラウザ（別端末）で同じアカウントにログイン**し、同じ復習キューと連続日数が見える
- [ ] ログアウト → `/mypage` がログインゲートに戻り、前アカウントの進捗が残らない
- [ ] 同一ブラウザで別アカウントにログインしても、他人の進捗・お気に入りが混ざらない
- [ ] ログイン直後の一瞬でも localStorage 由来の単語が表示されない（`favoritesStatus` ゲート）
- [ ] オフラインにして `/mypage` を開く → 再試行ボタン付きのエラー表示（localStorage へ黙ってフォールバックしない）
- [ ] 採点保存を一度失敗させたあと通信を戻して再訪／再採点すると、`toeic-review-outbox-v1:<user-id>` が再送後に削除され、Supabaseへ反映される
- [ ] 複数単語を素早く連続採点しても、最後の採点まで順番にSupabaseへ反映され、古いレスポンスで上書きされない

---

## 4. ロールバック

コードを戻すだけでよい。テーブルを削除する必要はない（RLS 付きで他に影響しないため、
残しておけば再デプロイ時に学習記録が復活する）。完全に消す場合のみ:

```sql
drop table if exists public.word_review_progress;
drop table if exists public.learning_streaks;
```

---

## 5. 記録欄

| 項目 | 状態 | 記入日 |
| --- | --- | --- |
| Google ログインの実機確認 | （未記入） | |
| `20260827000000_word_review_progress.sql` の実行 | （未記入） | |
| ローカルでのスモークテスト | （未記入） | |
| 本番でのスモークテスト | （未記入） | |


### マイページの達成表示・定着度別一覧（2026-09-06）

- 今日の目安は `REVIEW_SESSION_LIMIT`（現在10語、対象が少なければ対象数）とし、到達後は達成メッセージと「もう N 語復習する」を表示する。期限到来の残件数は別に表示する。
- due / weak の固定セッションでは、完了語数・初期語数・残り語数を復習画面に表示する。全件モードと学習モードには表示しない。
- 苦手単語の × は「覚えていない」の累計回数と明記し、開始時の上限を適用した対象語数をボタンに表示する（途中再開時は保存済みセッションが優先）。
- 定着度は成果を中心に表示する。区分ボタンを押すとマイページ内で該当単語一覧を展開し、0件時は空状態を表示する。分類は `getRetentionLevel` を集計と共用し、詳細へのリンクは `from=mypage` を付ける。
- 確認項目：10語達成表示、due/weak の進捗と詳細からの復帰、4区分の件数と一覧、空区分、スマートフォン幅とキーボード操作。
