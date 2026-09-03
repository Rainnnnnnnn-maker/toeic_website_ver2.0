# Phase 1 準備ドキュメント: ログイン任意 + お気に入り同期（Supabase）

> 元資料: [improvement-proposal.md](./improvement-proposal.md) の「Phase 1: 最小ローンチ」（§5.1 / §6 / §8）
> 対象ブランチ: `42-add-user-sign-in-and-login-pag`（GitHub Issue [#42](https://github.com/Rainnnnnnnn-maker/toeic_website_ver2.0/issues/42)）
> 作成日: 2026-07-10
> 本番 URL: `https://www.toeic-words.com`

## 0. このドキュメントの目的

**このファイルだけ読めば、いつ中断しても Phase 1 の実装を再開できる**ことがゴール。

- §3 のチェックリスト = **あなた（Rain）の手動操作**。コードを書く前に必要な外部サービス側の準備。
- §5 のチェックリスト = **実装タスク**。Claude Code に「このドキュメントの §5 を進めて」と指示すれば再開できる。
- 進捗はこのファイルのチェックボックスを直接編集して記録する。
- §4 に取得した値の**記録欄**がある（シークレットは書かない。「設定済みか」だけ記録）。

---

## 1. スコープ

### やること（Phase 1）

- Supabase 導入（Auth + Postgres の `profiles` / `favorites` テーブルのみ）
- ログイン任意: **未ログインでも今まで通り全機能が localStorage で動く**（体験を落とさない）
- ログイン時: お気に入りを Supabase に保存し、複数端末で同期
- 初回ログイン時に localStorage のお気に入りを Supabase にマージ
- プライバシーポリシー等の「会員登録なし」文言の更新

### やらないこと（Phase 2 以降）

- SRS（SM-2）・学習進捗の保存・学習セッション履歴
- プロフィール設定 UI（目標スコア・試験日など）
- ダッシュボード・AI 品質管理・ランキング

---

## 2. 現状スナップショット（2026-07-10 時点）

再開時はまずここと実コードの差分を確認する。

| 項目                 | 現状                                                                                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| お気に入りの実装     | `src/context/FavoritesContext.tsx` — localStorage のみ。**キー名は `toeic_favorites`**（提案書 §5.1 のコード例は `'favorites'` になっているが誤り。実装時は `STORAGE_KEY` 定数を使うこと）      |
| Provider の場所      | `src/app/layout.tsx` で `FavoritesProvider` をラップ済み                                                                                                                                                    |
| お気に入り表示ページ | `/review`（一覧）、`/favorites` + `/favorites/listen`（リッスンモード）                                                                                                                                   |
| Supabase 関連        | **未導入**。`package.json` に `@supabase/*` なし、`.env.example` に Supabase 変数なし、`src/lib/supabase/` なし                                                                                   |
| proxy                | `src/proxy.ts.disabled` が存在（**Vercel の Proxy 実行量削減のため意図的に無効化中**、matcher は空）。Supabase セッションリフレッシュ導入時に最小 matcher で有効化する                                  |
| ログインページ       | なし。Issue#42 は Email+Password 前提の文面だが、提案書 Phase 1 は「Google + Email Magic Link」を推奨（→ §6 未決事項）                                                                                        |
| 文言（要更新箇所）   | `src/app/(web-info)/about/page.tsx:33`・`src/app/(web-info)/privacy/page.tsx:45`・`src/app/page.tsx:338`・`src/app/(web-info)/donate/page.tsx:7,33` に「会員登録不要 / サーバーに送信されない」記述あり |
| CI                   | lint + test のみ。build はローカルで実行してから push                                                                                                                                                           |

---

## 3. 手動準備チェックリスト（あなたの操作）

コード実装の**前**に完了させる。所要 30〜60 分。

### 3-1. Supabase プロジェクト作成

- [X] https://supabase.com にサインアップ / ログイン（GitHub アカウント連携が楽）
- [X] 「New Project」でプロジェクト作成
  - Organization: 個人用でよい
  - Name: `toeic-words`（任意）
  - Database Password: 強いパスワードを生成し**パスワードマネージャに保存**（Phase 1 のコードでは使わないが、後で必要になる）
  - **Region: Northeast Asia (Tokyo)** ← 必ず東京を選ぶ。後から変更不可
  - Plan: Free
- [X] プロジェクトが起動したら **Project Settings → API** で以下 2 つを控える
  - `Project URL`（`https://xxxx.supabase.co`）
  - `Publishable key`（`sb_publishable_...`。旧 UI では `anon` キー。**どちらでも動く**。クライアント公開前提のキーで、RLS で保護される）
  - ※ `Secret key`（`sb_secret_...` / 旧 `service_role`）は **Phase 1 では不要**。取得・保存しない（RLS をバイパスする危険なキーのため、必要になる Phase まで触らない）

> ⚠️ **Free プランはプロジェクトが約 1 週間無操作で一時停止（pause）される。**
> 実装を中断して数週間後に再開する場合、Supabase ダッシュボードで「Restore project」してから作業すること。再開手順（§8）にも記載。

### 3-2. データベーススキーマ作成（SQL Editor で実行）

- [X] Supabase ダッシュボード → **SQL Editor** → 下記をそのまま貼り付けて Run

```sql
-- ============================================
-- Phase 1: profiles + favorites のみ
-- (improvement-proposal.md §4.2 のサブセット + 自動プロフィール作成)
-- ============================================

-- 1. profiles（Phase 1 では中身は最小。Phase 2 で列を活用）
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. favorites（サーバー側お気に入り）
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word_slug text not null,
  created_at timestamptz default now(),
  unique (user_id, word_slug)
);

create index idx_favorites_user on public.favorites (user_id);

-- 3. RLS（自分のデータのみ全操作可）
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own favorites" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. updated_at 自動更新
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

-- 5. サインアップ時に profiles 行を自動作成
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [X] **Table Editor** で `profiles` / `favorites` が作成され、両方に RLS バッジが付いていることを確認

### 3-3. Google ログイン設定（Google Cloud Console + Supabase）

- [X] https://console.cloud.google.com で新規プロジェクト作成（既存の TTS 用プロジェクトと分けても同じでもよい）
- [ ] 「API とサービス → OAuth 同意画面」を設定
  - User Type: **外部（External）**
  - アプリ名: `TOEIC重要単語`、サポートメール: 自分のメール
  - 承認済みドメイン: `toeic-words.com` と `supabase.co`
- [ ] 「認証情報 → 認証情報を作成 → OAuth クライアント ID」
  - アプリケーションの種類: **ウェブアプリケーション**
  - 承認済みのリダイレクト URI: `https://<project-ref>.supabase.co/auth/v1/callback`
    （`<project-ref>` は 3-1 の Project URL のサブドメイン部分。Supabase の Google Provider 設定画面にも表示される）
- [ ] 発行された **クライアント ID** と **クライアントシークレット** を控える
- [ ] Supabase ダッシュボード → **Authentication → Sign In / Providers → Google** を有効化し、上記 ID / シークレットを貼り付けて Save

### 3-4. Email ログインの方針確認（→ §6 未決事項 D-1 を先に決める）

> ⚠️ **Supabase 内蔵メール送信は「プロジェクトのチームメンバー宛のみ・毎時数通」に制限されている。**
> 一般ユーザーに Magic Link / 確認メールを送るには**カスタム SMTP（Resend 無料枠など）の設定が必須**。

- [X] 方針を決める → **決定 (2026-07-12): Google ログインのみ**（SMTP 設定不要。Email は将来 SMTP 設定後に追加）
- [ ] （Email も出す場合のみ）Resend 等で SMTP 情報を取得 → Supabase **Authentication → Emails → SMTP Settings** に設定

### 3-5. リダイレクト URL 設定（Supabase 側）

- [ ] Supabase ダッシュボード → **Authentication → URL Configuration**
  - Site URL: `https://www.toeic-words.com`
  - Redirect URLs に追加:
    - `http://localhost:3000/**`（ローカル開発）
    - `https://www.toeic-words.com/**`（本番）
    - `https://*-<vercel-team-or-user>.vercel.app/**`（プレビューデプロイ。Vercel のプレビュー URL パターンに合わせる）

### 3-6. 環境変数の設定

- [X] ローカル `.env.local` に追記:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # 3-1 で控えた Publishable key
```

- [X] Vercel ダッシュボード → プロジェクト → **Settings → Environment Variables** に同じ 2 変数を追加（Production / Preview / Development すべてにチェック）

> `NEXT_PUBLIC_` プレフィックスなのでクライアントに露出するが、これは**公開前提のキー**（RLS が防御線）。Secret key / service_role は絶対に env に入れない（Phase 1 では不要）。

---

## 4. 取得済み情報の記録欄（シークレットは書かない）

| 項目                                       | 値 / 状態                              | 記入日     |
| ------------------------------------------ | -------------------------------------- | ---------- |
| Supabase Project Ref（URL のサブドメイン） | （未記入）                             |            |
| Supabase リージョン                        | Tokyo 予定                             |            |
| Google OAuth クライアント作成              | **未**（スモークテスト前に必須） |            |
| カスタム SMTP                              | 不要（Google のみで運用）              | 2026-07-12 |
| Vercel 環境変数 2 件                       | 済                                     | 2026-07-12 |
| DB スキーマ（3-2 の SQL）                  | 実行済                                 | 2026-07-12 |

---

## 5. 実装タスクチェックリスト（コード側 / Claude Code に依頼可）

§3 完了後に着手。**§6 の設計方針・注意点を必ず読んでから実装すること。**

### 5-1. 基盤

- [X] `npm install @supabase/supabase-js @supabase/ssr`（`package.json` の dependencies に追加）
- [X] `.env.example` に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` を追記
- [X] `src/lib/supabase/client.ts` — `createBrowserClient`（env 変数名は `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`）
- [X] `src/lib/supabase/server.ts` — `createServerClient` + `cookies()`（`import "server-only"` 付き）
- [X] `src/proxy.ts.disabled` → `src/proxy.ts` に置換し、Supabase セッションリフレッシュ実装
  - matcher は `["/login", "/auth/:path*"]` に最小化（§6 N-2 の最小案を採用。`/api/tts`・`/api/revalidate` は当然対象外）

### 5-2. 認証フロー

- [X] `src/app/auth/callback/route.ts` — 認可コード交換（`exchangeCodeForSession`、open redirect 対策付き）→ 元ページへリダイレクト
- [X] `src/app/login/page.tsx` + `src/components/features/auth/LoginClient.tsx` — Google ログインのみ（noindex、「ログインは任意」の説明入り）
- [X] ログアウト処理（クライアント `supabase.auth.signOut()`、`AuthContext` の `signOut`）
- [X] ログイン状態表示 — `src/context/AuthContext.tsx`（`onAuthStateChange` 購読）+ TOP 右上の `AuthStatus` + Footer のログイン/ログアウトリンク（サイトに共通ヘッダーがないため）

### 5-3. お気に入り同期

- [X] `src/context/FavoritesContext.tsx` を拡張:
  - 未ログイン: 現行どおり localStorage（`STORAGE_KEY = "toeic_favorites"`）
  - ログイン済み: Supabase `favorites` テーブルを読み書き（楽観的更新: ローカル state 即時反映 → 裏で upsert / delete）
  - 公開 API（`favorites` / `toggleFavorite` / `isFavorite` 等）の**型は変えない** — 利用側コンポーネント（`/review`、`/favorites`、単語詳細など）は無改修で済ませる
- [X] 初回ログイン時マージ処理: localStorage の `toeic_favorites` を `favorites` テーブルへ upsert（`onConflict: 'user_id,word_slug', ignoreDuplicates: true`）
  - マージ成功時のみ localStorage をクリアし `toeic_favorites_merged_at` を記録。失敗時は localStorage を残す（次回ログインで再マージ）
- [X] 純ロジックを `src/lib/favorites-sync.ts` に切り出し、`src/lib/(tests)/favorites-sync.test.ts` で Vitest ユニットテスト（15 ケース）

### 5-4. 文言・ドキュメント更新（同一 PR 必須）

- [X] `src/app/(web-info)/privacy/page.tsx` — 収集情報にアカウント情報を追記し、任意ログイン時の Supabase 保存を明記（最終更新日も更新）
- [X] `src/app/(web-info)/about/page.tsx` — 任意 Google ログインの説明を追記
- [X] `src/app/page.tsx` / `src/app/(web-info)/donate/page.tsx` — 「会員登録不要（ログインは任意）」等に調整
- [X] `README.md` と `docs/architecture.md`（最終更新日・更新履歴 4.5）を更新

### 5-5. 検証

- [X] `npm run lint` / `npm run test` / `npm run build` すべて成功（2026-07-12）
- [ ] §7 のスモークテストを実施（**要: §3-3 Google OAuth 設定と §3-5 Redirect URL 設定の完了**）
- [ ] （任意・提案書 §10）Playwright E2E — D-3 の決定により Phase 1 では見送り（導入する場合は別タスク化）

---

## 6. 設計方針（決定済み）と未決事項（実装前に決める）

### 決定済みの方針

- **N-1: 認証状態の取得はクライアント側を基本にする。**
  このリポジトリは `cacheComponents: true` のため、`cookies()` を読む Server Component は cached scope に置けない（`'use cache'` 内で `cookies()` は使用不可）。ヘッダーのログイン表示などは**ブラウザクライアント（`onAuthStateChange`）で解決**し、既存ページの静的キャッシュ・SSG（`/words/[word]` 等）を壊さないこと。サーバー側で user が必要なのは Server Action / Route Handler 内だけに留める。
- **N-2: proxy（middleware）の実行量に注意。**
  `src/proxy.ts.disabled` は Vercel の Proxy 実行量削減のために無効化された経緯がある。有効化する際、matcher は静的アセット・`/api/tts`・`/api/revalidate` を除外し、可能ならさらに絞る（極端には `/login`・`/auth` 配下だけでも Phase 1 は成立する — クライアント側で `getUser()` すればセッションは維持される）。実装時に Vercel の使用量グラフを確認すること。
- **N-3: localStorage キーは `toeic_favorites`。** 提案書のコード例（`'favorites'`）をコピペしない。
- **N-4: React Compiler 有効。** `useMemo` / `useCallback` を手書きしない。
- **N-5: クライアント/サーバー境界。** Supabase の server クライアントは `import "server-only"`。共有定数（storage キー名等）はどちらからも import できる中立モジュール（`src/lib/`）に置く（`"use client"` モジュールの export はサーバーで undefined になる既知の罠）。

### 未決事項（再開時にまず決める）

すべて 2026-07-12 に決定済み。

- [X] **D-1: ログイン方式。** → **Google ログインのみ**で実装（SMTP 不要・実装最小）。Email 系は SMTP 設定（3-4）後に追加検討。Issue #42 の本文更新は未対応（TODO）。
- [X] **D-2: ログアウト時の挙動。** → 当初「書き戻さない」で実装したが、スモークテストで「ログアウトするとお気に入りが消えたように見える」ことが判明し、**改定 (2026-07-12): ログアウト時にアカウントのお気に入りを localStorage へ書き戻す**方式に変更。ログアウト後も同じお気に入りが見え続ける（共用端末ではアカウントのお気に入りが端末に残る点は許容）。**追加改定（同日）**: 書き戻しデータが同一ブラウザの別アカウントへマージされる混入をレビュー指摘で検出。書き戻し時に `toeic_favorites_owner` に持ち主のユーザー ID を記録し、ログイン時に照合して「印なし（ゲスト）or 本人」のみマージ、別人の印ならマージも表示合流もしない（`shouldMergeLocalFavorites`）。
- [X] **D-3: Playwright E2E。** → **Phase 1 では見送り**（現行の「Vitest 純ロジック + 手動スモーク」規約を維持）。導入する場合は CI 設定含め別タスク化。
- [X] **D-4: マージ後の localStorage。** → **成功時のみ削除** + `toeic_favorites_merged_at` を記録。失敗時は残置し次回ログインで再マージ（upsert `ignoreDuplicates` なので冪等）。

---

## 7. 動作確認手順（スモークテスト）

`npm run dev` で以下を手動確認（ブラウザ確認は Rain が実施する運用）:

1. **未ログイン（リグレッション確認）**: お気に入り追加/削除 → リロードで保持 → `/review`・`/favorites`・`/favorites/listen` が従来どおり動く
2. **ログイン**: `/login` → Google ログイン → 元のページに戻る → ヘッダーにログイン状態が表示される
3. **マージ**: 未ログインでお気に入りを 2〜3 件付けてからログイン → Supabase Table Editor の `favorites` に該当行ができている
4. **同期**: ログイン状態で別ブラウザ（またはシークレットウィンドウ）から同じアカウントでログイン → 同じお気に入りが見える
5. **RLS**: 別の Google アカウントでログイン → 他人のお気に入りが**見えない**こと
6. **ログアウト**: ログアウト後もお気に入りがそのまま見える（アカウントの内容が localStorage へ書き戻される）＋未ログイン機能が正常
7. **回帰**: `/words/[word]` の表示・TTS 再生・今日の 5 単語が無影響であること（proxy の matcher ミスがあるとここが遅くなる/壊れる）
8. **アカウント切替（混入防止）**: アカウント A でお気に入りを付けてログアウト → 同じブラウザで別アカウント B でログイン → A のお気に入りが B に**表示されず、B のアカウントにも登録されない**こと（Supabase Table Editor で B の行を確認）

---

## 8. 実装再開の手順（このドキュメントの使い方）

1. ブランチ `42-add-user-sign-in-and-login-pag` に切り替え、`main` を取り込む（`git merge main` 等）
2. **Supabase プロジェクトが pause していないか確認**（Free プランは約 1 週間無操作で停止 → ダッシュボードで Restore）
3. §3 / §5 のチェックボックスで進捗を確認し、§6 の未決事項に未回答があればまず決める
4. `.env.local` に §3-6 の 2 変数があるか確認
5. Claude Code に依頼する場合の指示例:
   > `docs/operations/phase1-login-favorites-sync-setup.md` を読んで、§5 の未完了タスクを続きから実装して。§6 の方針・注意点に従うこと。
   >
6. 完了したタスクはこのファイルのチェックボックスを `[x]` に更新してコミットする

---

## 9. 参考リンク

- [Supabase + Next.js App Router 公式ガイド（@supabase/ssr）](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Google ログイン設定](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase カスタム SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- 元提案書: [improvement-proposal.md](./improvement-proposal.md)（§4.2 フルスキーマ / §8 実装コード例 / §9 リスク表）
