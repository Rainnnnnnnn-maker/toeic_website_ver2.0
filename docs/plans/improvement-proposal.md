# 改善提案書: Supabase / 無料 BaaS 導入による `toeic_website_ver2.0` の機能強化

> 対象リポジトリ: `Rainnnnnnnn-maker/toeic_website_ver2.0`
> 作成日: 2026 年 (JST)
> 前提: Next.js 16.2 + React 19 + TypeScript 5 + Vercel 運用中

---

## 0. エグゼクティブサマリ

現行アーキテクチャは「キャッシュ最適化・コスト管理・セキュリティ許可リスト」など**インフラ運用面で卓越**している一方、**ユーザー進捗の永続化・SRS の本格実装・AI 出力の品質管理**の 3 点で DB レイヤー不在がボトルネックになっている。

**Supabase を導入すれば**:
- 無料枠 (500MB DB / 50K MAU Auth / 1GB Storage) で、現行のトラフィック規模なら**数年無料で運用可能**
- PostgreSQL + RLS により、Server Action / Route Handler から型安全にアクセス可能
- 既存の Upstash Redis は「短期キャッシュ」、Supabase は「永続データ」と役割分担でき、**現在の強みを活かしながら弱点を補完**できる

---

## 1. 現状の課題再確認（BaaS で解決できるもの中心）

| # | 課題 | 現状の影響 | BaaS で解決可否 |
|---|---|---|---|
| 1 | ユーザーアカウントなし | お気に入り = localStorage のみ → デバイス間で消える | ✅ Auth で解決 |
| 2 | 学習進捗のサーバー保存なし | 「覚えた/覚えてない」がセッション内のみ | ✅ DB で解決 |
| 3 | SRS（間隔反復）未実装 | ガイド記事で SRS を推奨しておきながら機能不在 | ✅ DB で解決 |
| 4 | 弱点分析・パーソナライズ不可 | 全員同じ「今日の6単語」 | ✅ DB で解決 |
| 5 | AI 生成結果の品質管理不在 | ハルシネーションが 30 日キャッシュされる | ✅ レビューテーブルで解決 |
| 6 | 学習統計・モチベーション機能なし | 継続率向上の余地大 | ✅ DB で解決 |
| 7 | フォールバック不在 | Gemini 障害時の挙動不明 | △ DB に前回正常値を保存で緩和 |

---

## 2. 無料 BaaS 比較

| BaaS | DB 種類 | 無料枠 DB | 無料枠 Auth MAU | Next.js 16 相性 | RLS / セキュリティ | リージョン | 総評 |
|---|---|---|---|---|---|---|---|
| **Supabase** ⭐推奨 | PostgreSQL | 500MB | 50K/月 | ◎ (`@supabase/ssr`, Server Action 対応) | ◎ (RLS 標準) | Tokyo (ap-northeast-1) | **最推奨**。SQL・型生成・RLS が Next.js 16 と完璧に噛む |
| Firebase | Firestore (NoSQL) | 1GB | 50K/月 (Email) / 無限 (Google) | ○ | △ (Rules は SQL ほど表現力ない) | us-central1 | NoSQL なので複雑クエリ・集計が苦手。TOEIC 単語の分析系には不向き |
| Cloudflare (D1+Workers+Auth) | SQLite (D1) | 5GB | 50K/月 (Workers Access 別) | ○ (Edge Runtime 必須) | △ | 全球エッジ | コスト最安だが Auth がまだ発展途上。D1 は書き込み性能に制限 |
| Appwrite | MariaDB | 1GB (セルフホスト時は無限) | 無限 (セルフホスト) | △ | ○ | 任意 | セルフホスト前提だと運用負荷増。マネージド無料枠は小さい |
| Nhost | PostgreSQL (Hasura) | 0.5GB | 無制限 (Auth0 連携) | ○ | ◎ (Hasura Permissions) | us-east-1 / eu-central-1 | Supabase と同等だがコミュニティ・ドキュメント量で劣る |

### 2.1 なぜ Supabase を推すか

1. **PostgreSQL** であること → SRS の複雑クエリ（「過去7日で2回以上ミスした単語を難易度順に」）が SQL 1発で書ける
2. **Row Level Security (RLS)** → クライアントからの直接アクセスでも安全。Server Action 不要の場面も
3. **TypeScript 型自動生成** (`supabase gen types`) → 既存の厳密な TS 設計と整合
4. **`@supabase/ssr`** パッケージが Next.js App Router に公式対応
5. **Tokyo リージョン** → 日本の TOEIC 学習者向けにレイテンシ最小
6. **既存 Upstash Redis と競合しない** → Redis = L2 キャッシュ、Supabase = 永続データと役割分担明確

---

## 3. 推奨アーキテクチャ（導入後）

```
┌──────────────────────────────────────────────────────────────┐
│                        Next.js 16 (Vercel)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │ RSC / SSG   │  │ Server      │  │ Route Handlers       │  │
│  │ (単語詳細)   │  │ Actions     │  │ (/api/tts, /revalidate)│ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘  │
└─────────┼────────────────┼────────────────────┼──────────────┘
          │                │                    │
   ┌──────▼──────┐  ┌──────▼──────┐      ┌──────▼──────┐
   │  Vercel Blob │  │  Supabase   │      │ Upstash Redis│
   │ (単語リスト) │  │  PostgreSQL │      │  (L2 Cache)  │
   │              │  │ + Auth      │      │  + Ratelimit │
   │ __words__/   │  │ + Storage   │      │              │
   │   word.txt   │  │             │      │  word:<slug> │
   └──────────────┘  └──────┬──────┘      └──────────────┘
                             │
                ┌────────────┴───────────┐
                │  users                 │
                │  word_progress (SRS)   │
                │  favorites             │
                │  study_sessions        │
                │  ai_reviews            │
                │  learning_streaks      │
                └────────────────────────┘

   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ Gemini API  │  │ Google TTS  │  │ GA4 / Ads   │
   └─────────────┘  └─────────────┘  └─────────────┘
```

**役割分担**:
- **Vercel Blob**: 単語リスト（既存のまま）
- **Upstash Redis**: 単語詳細 JSON の L2 キャッシュ・Rate Limit（既存のまま）
- **Supabase Postgres**: ユーザー・進捗・SRS・レビュー等の**永続データ**（NEW）
- **Supabase Auth**: ログイン（NEW）
- **Supabase Storage**: ユーザーアバター等（必要なら）

---

## 4. データベーススキーマ設計案

### 4.1 ER 概要

```
auth.users (Supabase 標準)
   │ 1:1
   ▼
profiles ────────────────┐
   │ 1:N                 │
   ▼                     │
word_progress ──────┐    │
   │ N:1 (word slug) │    │
   │                 │    │
favorites           │    │
   │ N:1 (word slug) │    │
   │                 │    │
study_sessions      │    │
   │ 1:N             │    │
   ▼                 │    │
study_session_items ┘    │
                          │
ai_word_reviews ─────────┘
   │ N:1 (word slug)
   │
   ▼
word_corrections (ユーザー修正提案)

learning_streaks (1:1 with profiles)
```

### 4.2 SQL マイグレーション（Supabase SQL Editor で実行）

```sql
-- ========================================
-- 1. profiles
-- ========================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  target_score int check (target_score between 400 and 990),
  exam_date date,
  avatar_url text,
  preferred_voice text default 'en-US-Wavenet-C',
  notification_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================================
-- 2. word_progress (SRS のコア)
-- SM-2 アルゴリズム準拠
-- ========================================
create type word_status as enum ('new', 'learning', 'review', 'mastered');

create table public.word_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word_slug text not null,
  status word_status not null default 'new',
  -- SM-2 フィールド
  easiness_factor real not null default 2.5 check (easiness_factor >= 1.3),
  interval_days int not null default 0,
  repetitions int not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  -- 統計
  total_reviews int not null default 0,
  correct_count int not null default 0,
  incorrect_count int not null default 0,
  last_quality smallint check (last_quality between 0 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, word_slug)
);

create index idx_word_progress_next_review
  on public.word_progress (user_id, next_review_at)
  where next_review_at is not null;

create index idx_word_progress_status
  on public.word_progress (user_id, status);

-- ========================================
-- 3. favorites (サーバー側お気に入り)
-- ========================================
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word_slug text not null,
  note text,
  created_at timestamptz default now(),
  unique (user_id, word_slug)
);

create index idx_favorites_user on public.favorites (user_id);

-- ========================================
-- 4. study_sessions (学習セッション履歴)
-- ========================================
create type session_mode as enum ('study', 'review', 'listen', 'flashcard');

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode session_mode not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_items int default 0,
  correct_items int default 0,
  duration_sec int
);

create index idx_study_sessions_user_date
  on public.study_sessions (user_id, started_at desc);

-- ========================================
-- 5. study_session_items (セッション内の各単語の結果)
-- ========================================
create table public.study_session_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  word_slug text not null,
  remembered boolean not null,
  time_spent_ms int,
  hint_used boolean default false,
  created_at timestamptz default now()
);

create index idx_session_items_session on public.study_session_items (session_id);
create index idx_session_items_word on public.study_session_items (word_slug);

-- ========================================
-- 6. ai_word_reviews (AI 生成結果の品質管理キュー)
-- ========================================
create type review_status as enum ('pending', 'approved', 'flagged', 'corrected');

create table public.ai_word_reviews (
  id uuid primary key default gen_random_uuid(),
  word_slug text not null,
  field text not null check (field in ('definition', 'example', 'synonym', 'pronunciation')),
  issue_type text check (issue_type in ('hallucination', 'typo', 'unnatural', 'incorrect_pos', 'other')),
  reported_by uuid references auth.users(id) on delete set null,
  reporter_note text,
  status review_status not null default 'pending',
  admin_note text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create index idx_ai_reviews_status on public.ai_word_reviews (status, created_at);

-- ========================================
-- 7. word_corrections (修正提案 / コミュニティ編集)
-- ========================================
create table public.word_corrections (
  id uuid primary key default gen_random_uuid(),
  word_slug text not null,
  field text not null,
  original_value text,
  proposed_value text not null,
  proposed_by uuid not null references auth.users(id) on delete cascade,
  upvotes int default 0,
  status review_status not null default 'pending',
  applied_at timestamptz,
  created_at timestamptz default now()
);

-- ========================================
-- 8. learning_streaks (連続学習日数)
-- ========================================
create table public.learning_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_study_date date not null default current_date,
  total_study_days int not null default 0,
  updated_at timestamptz default now()
);

-- ========================================
-- 9. RLS ポリシー
-- ========================================
alter table public.profiles enable row level security;
alter table public.word_progress enable row level security;
alter table public.favorites enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_session_items enable row level security;
alter table public.ai_word_reviews enable row level security;
alter table public.word_corrections enable row level security;
alter table public.learning_streaks enable row level security;

-- ユーザー自身のデータのみアクセス可能
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own progress" on public.word_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own favorites" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own sessions" on public.study_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own session items via session" on public.study_session_items
  for all using (
    exists (
      select 1 from public.study_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "ai reviews: anyone can report, admin reads" on public.ai_word_reviews
  for insert with check (true);
create policy "ai reviews: admin read" on public.ai_word_reviews
  for select using (auth.uid() in (select id from public.profiles where is_admin = true));

create policy "own streak" on public.learning_streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ========================================
-- 10. updated_at 自動更新トリガー
-- ========================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger word_progress_updated_at before update on public.word_progress
  for each row execute function public.handle_updated_at();
```

### 4.3 Prisma 連携（任意・既存プロジェクトと合わせる場合）

`prisma/schema.prisma` に同等のモデルを定義し、`bun run db:push` で Supabase に接続可能。ただし RLS は Prisma ではバイパスされるため、**Service Role Key の取り扱いに注意**（サーバー側のみ）。

---

## 5. 機能提案（Supabase 導入で実現可能になるもの）

### 5.1 🎯 ユーザーアカウント & 進捗同期 【優先度: 最高】

**初回リリースでは範囲を絞る**:
- まずは「ログイン任意 + お気に入り同期 + ゲストモード維持」だけを実装する
- SRS・学習進捗・プロフィール設定は、ログイン導線と同期品質を確認してから Phase 2 以降で追加する
- 未ログインユーザーの体験を落とさず、ログインは「複数端末でお気に入りを同期したい人向け」の任意機能として出す

**機能（最終形）**:
- Google / GitHub / Email / Magic Link ログイン（Supabase Auth）
- ゲストモード維持（未ログインでも localStorage で動作 → ログイン時にマージ）
- プロフィール設定（目標スコア・試験日・好みの音声）

**マイグレーション戦略**:
```ts
// Phase 1 では、ログイン時に localStorage のお気に入りだけを Supabase に取り込む
async function mergeLocalFavoritesOnLogin(userId: string) {
  const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  await supabase.from('favorites').upsert(
    localFavorites.map((slug: string) => ({ user_id: userId, word_slug: slug })),
    { onConflict: 'user_id,word_slug', ignoreDuplicates: true }
  );

  localStorage.removeItem('favorites');
}
```

---

### 5.2 🔁 本格 SRS（間隔反復学習） 【優先度: 最高】

**SM-2 アルゴリズム実装例**（`src/lib/srs.ts`）:

```ts
interface SRSInput {
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0-2: 忘却, 3-5: 記憶
  repetitions: number;
  easinessFactor: number;
  intervalDays: number;
}

interface SRSOutput {
  easinessFactor: number;
  repetitions: number;
  intervalDays: number;
  nextReviewAt: Date;
  status: 'new' | 'learning' | 'review' | 'mastered';
}

export function calculateSM2(input: SRSInput): SRSOutput {
  const { quality, repetitions, easinessFactor, intervalDays } = input;

  let newEF = easinessFactor;
  let newReps = repetitions;
  let newInterval = intervalDays;

  if (quality < 3) {
    // 忘却 → リセット
    newReps = 0;
    newInterval = 1;
  } else {
    newReps += 1;
    if (newReps === 1) newInterval = 1;
    else if (newReps === 2) newInterval = 6;
    else newInterval = Math.round(intervalDays * easinessFactor);
  }

  // EF 更新 (下限 1.3)
  newEF = Math.max(
    1.3,
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  const status: SRSOutput['status'] =
    newReps === 0 ? 'learning' :
    newInterval >= 21 ? 'mastered' : 'review';

  return { easinessFactor: newEF, repetitions: newReps, intervalDays: newInterval, nextReviewAt, status };
}
```

**新ルート**:
- `/review/srs` — 「今日復習すべき単語」（`next_review_at <= now()` の一覧）
- 復習完了時に `word_progress` を更新
- 連続学習日数バッジ (`learning_streaks`)

---

### 5.3 📊 学習統計ダッシュボード 【優先度: 高】

**新ルート `/dashboard`**:
- 連続学習日数（Streak 🔥）
- 累計学習単語数 / 習得済み（mastered）数
- レベル別（Important / Medium / High）進捗バー
- 週次学習時間グラフ（`study_sessions` 集計）
- パート別正答率（`study_session_items` から単語レベルで逆算）
- 「あと N 語で目標スコア到達」表示

**実装クエリ例**:
```sql
-- 今週の学習時間
select date_trunc('day', started_at) as day,
       sum(duration_sec) as total_sec,
       count(*) as sessions
from study_sessions
where user_id = $1 and started_at >= now() - interval '7 days'
group by day order by day;

-- ステータス別単語数
select status, count(*) from word_progress
where user_id = $1 group by status;
```

---

### 5.4 🐛 AI 生成結果の品質管理フロー 【優先度: 高】

**問題**: Gemini のハルシネーションが 30 日キャッシュされ、ユーザーが間違いに気づいても報告手段がない。

**解決**:
- 単語詳細ページに「⚠️ 報告する」ボタン → `ai_word_reviews` テーブルに INSERT
- 管理画面 `/admin/reviews`（RLS で管理者のみ）:
  - pending 一覧
  - approve / flag / correct アクション
  - 修正時は Upstash Redis の該当キー削除 + Next.js revalidateTag
- 一定数の flag が溜まった単語は自動的に再生成キューに

**ユーザーインセンティブ**:
- 報告者にバッジ付与
- 採用された修正提案は `word_corrections.upvotes` で評価

---

### 5.5 🎯 パーソナライズされた弱点分析 【優先度: 中】

**機能**:
- 「よく間違える単語 Top 20」自動抽出（`word_progress.incorrect_count` 降順）
- 「直近7日で2回以上ミス」セット
- 「3日以上復習していない習得済み単語」自動復習セット
- 目標スコア別（600 / 730 / 860）の推奨学習単語セット

**既存の「今日の6単語」を置き換え**:
- 未ログイン: 従来通り UTC 日付ハッシュベース
- ログイン済み: 「今日復習すべき単語」優先、不足分をハッシュ補完

---

### 5.6 🔔 学習リマインダー（Web Push） 【優先度: 中】

- Supabase Auth のメール通知 or Web Push API
- 「復習すべき単語が 12 個あります」「連続学習 7 日達成！」
- Vercel Cron で毎日 JST 19:00 にチェック → 通知

---

### 5.7 🏆 ソーシャル学習要素 【優先度: 低】

- 週次ランキング（オプトイン制・匿名ハンドルネーム）
- 学習目標シェア（SNS 連携は既存の react-share を活用）
- フレンドの進捗表示（相互フォロー）

---

### 5.8 📱 オフライン対応強化 【優先度: 低】

- Service Worker (PWA) で学習中の単語リスト + WordDetails JSON をキャッシュ
- オフラインでの復習 → オンライン復帰時に `word_progress` をバッチ同期
- Conflict 解決: `updated_at` の新しい方を優先

---

### 5.9 🔄 Gemini 障害時のフォールバック強化 【優先度: 中】

**現状**: Gemini 障害時の挙動が不明。

**改善**:
- `ai_word_reviews` とは別に `word_details_backup` テーブル（or Supabase Storage に JSON）
- L1 (Next.js) / L2 (Upstash) ミス時に L0 (Supabase) を参照
- 3 層全ミス時のみ「AI 生成中」エラー表示

---

## 6. 移行フェーズ（段階的ローンチ）

### Phase 1: 最小ローンチ（ログイン任意 + お気に入り同期 + ゲスト維持）（1〜2 週間）

初回は Supabase 導入の価値を最小リスクで検証するため、**お気に入り同期だけ**に絞る。SRS・学習進捗・プロフィール設定・ダッシュボードは入れず、未ログイン時は現在と同じ localStorage 動作を維持する。

- [ ] Supabase プロジェクト作成（Tokyo リージョン）
- [ ] `@supabase/supabase-js` + `@supabase/ssr` インストール
- [ ] `src/lib/supabase/client.ts` (Browser) / `server.ts` (Server) / `proxy.ts` (Session refresh)
- [ ] スキーマ 4.2 のうち `profiles` / `favorites` のみ作成
- [ ] ログイン UI（Google + Email Magic Link）
- [ ] 既存 `FavoritesContext` をラップし、ログイン時は Supabase・未ログイン時は localStorage
- [ ] ログイン時の localStorage お気に入りマージ処理 (5.1)
- [ ] E2E: Playwright で「ログイン→お気に入り追加→別ブラウザで確認」
- [ ] プライバシーポリシー / About の「会員登録なし」記述を、ログイン任意の説明に更新

### Phase 2: SRS + 復習モード（3〜4 週間）

- [ ] スキーマ `word_progress` / `study_sessions` / `study_session_items` / `learning_streaks` を作成
- [ ] ログイン済みユーザー向けに学習進捗を Supabase に保存
- [ ] 未ログイン時の localStorage 進捗保存を検討（必要ならログイン時にマージ）
- [ ] `src/lib/srs.ts` 実装（SM-2）
- [ ] `/review/srs` ルート追加
- [ ] 既存 Study Mode に「覚えた/覚えてない」→ SM-2 quality 変換ロジック追加
- [ ] 復習リマインダー（Vercel Cron + Web Push or Email）
- [ ] 単体テスト: SM-2 アルゴリズムのエッジケース

### Phase 3: ダッシュボード + 品質管理（2〜3 週間）

- [ ] `/dashboard` ページ
- [ ] `ai_word_reviews` / `word_corrections` テーブル + RLS
- [ ] 単語詳細ページに「報告」ボタン
- [ ] `/admin/reviews` 管理画面（RLS で管理者のみ）
- [ ] 報告→修正→キャッシュクリア→revalidate の一連フロー

### Phase 4: パーソナライズ + ソーシャル（4〜6 週間）

- [ ] 弱点分析ロジック
- [ ] 「今日の6単語」をログイン済みユーザー向けに SRS ベースへ切替
- [ ] ランキング（オプトイン）
- [ ] オフライン同期 (Service Worker)

---

## 7. コスト試算

### 7.1 Supabase 無料枠（Free Plan）

| リソース | 無料枠 | 想定使用量 (1K MAU) | 余裕 |
|---|---|---|---|
| Database | 500 MB | 約 50 MB（1K ユーザー × 1300 単語 × 0.3 進捗） | 十分 |
| Auth MAU | 50,000 / 月 | 1,000 | 十分 |
| Storage | 1 GB | ほぼ未使用（アバター等小） | 十分 |
| Edge Functions | 500K 実行 / 月 | 不要（Server Action で十分） | — |
| Realtime | 200 接続 | 不要 | — |

**結論**: MAU 5,000 までは**完全無料**で運用可能。MAU 10,000 超で Pro Plan ($25/月) 検討。

### 7.2 既存コスト（参考）

| サービス | 現状想定 |
|---|---|
| Vercel (Hobby) | 無料 |
| Upstash Redis | Free (10K commands/day) |
| Vercel Blob | Free (1GB) |
| Google Gemini | Free tier 充分 |
| Google Cloud TTS | $4 / 100万文字（学習者数に依存） |

→ Supabase 追加でも**当面無料枠内**で完結。

---

## 8. 技術的実装メモ

### 8.1 Supabase クライアント初期化

```ts
// src/lib/supabase/client.ts (Browser)
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```ts
// src/lib/supabase/server.ts (Server Component / Route Handler)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

```ts
// src/proxy.ts (Session refresh)
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/tts|api/revalidate).*)'],
};
```

> ⚠️ proxy matcher から `/api/tts` と `/api/revalidate/*` を除外することが重要。Vercel Proxy 実行量を増やしすぎないよう、Session refresh が必要な範囲だけに絞る。

### 8.2 型生成

```bash
# Supabase CLI で型生成
supabase gen types --lang=typescript \
  --project-id <your-project-id> \
  > src/types/supabase.ts
```

### 8.3 Server Action 例（進捗更新）

```ts
// src/actions/progress.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateSM2 } from '@/lib/srs';
import { revalidatePath } from 'next/cache';

export async function updateWordProgress(
  wordSlug: string,
  quality: 0 | 1 | 2 | 3 | 4 | 5
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 既存進捗取得
  const { data: existing } = await supabase
    .from('word_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('word_slug', wordSlug)
    .single();

  const current = existing ?? {
    easiness_factor: 2.5,
    repetitions: 0,
    interval_days: 0,
  };

  const next = calculateSM2({
    quality,
    repetitions: current.repetitions,
    easinessFactor: current.easiness_factor,
    intervalDays: current.interval_days,
  });

  await supabase.from('word_progress').upsert({
    user_id: user.id,
    word_slug: wordSlug,
    ...next,
    last_reviewed_at: new Date().toISOString(),
    total_reviews: (existing?.total_reviews ?? 0) + 1,
    correct_count: (existing?.correct_count ?? 0) + (quality >= 3 ? 1 : 0),
    incorrect_count: (existing?.incorrect_count ?? 0) + (quality < 3 ? 1 : 0),
  }, { onConflict: 'user_id,word_slug' });

  revalidatePath('/dashboard');
  revalidatePath('/review/srs');
}
```

### 8.4 既存 Upstash Redis との役割分担

| レイヤ | 役割 | TTL |
|---|---|---|
| Next.js Data Cache (L1) | 単語詳細 JSON | `cacheLife('max')` + on-demand revalidate |
| Upstash Redis (L2) | 単語詳細 JSON の共有キャッシュ | 30 日 |
| **Supabase Postgres (NEW)** | ユーザー進捗・SRS・レビュー等の**永続データ** | なし |
| Supabase Storage (オプション) | ユーザーアバター・バックアップ JSON | なし |

→ Redis を**廃止せず**、キャッシュ専用として維持することで既存のパフォーマンス優位性を保持。

---

## 9. リスクと緩和策

| リスク | 影響度 | 緩和策 |
|---|---|---|
| RLS 設定ミスで他ユーザーデータ漏洩 | **致命的** | ステージング環境で `supabase test` (RLS テストユーティリティ) で全ポリシーをユニットテスト |
| 無料枠 DB 容量 (500MB) 超過 | 中 | `word_progress` に古い `mastered` レコードのアーカイブジョブ（90日以上更新なしは cold storage へ） |
| Supabase 障害時の学習停止 | 中 | クライアント側でオフラインキュー（IndexedDB）→ 復帰時にバッチ同期 |
| Auth のセッション刷新がミドルウェア実行量増 | 低 | matcher で静的パス・API を除外（8.1 参照） |
| マイグレーション中の localStorage / Supabelled データ不整合 | 中 | `mergeLocalDataOnLogin` をトランザクション化、失敗時は localStorage 残置 |
| Supabase URL / anon key のクライアント露出 | 低 | anon key は公開前提（RLS で保護）。service_role key は絶対にクライアントに書かない |

---

## 10. その他の改善点（BaaS 非依存）

前回レビューで指摘したうち、Supabase 導入以外で対応すべき項目:

| # | 項目 | 対応案 |
|---|---|---|
| 1 | LICENSE 未設定 | MIT LICENSE 追加 |
| 2 | E2E テスト不在 | Playwright 導入。Phase 1 は「ログイン→お気に入り同期→別ブラウザで確認」、Phase 2 以降で SRS 復習・リスニングを追加 |
| 3 | `.github/workflows` 可視性 | CI で `lint` + `typecheck` + `test` + Playwright を回す |
| 4 | Vercel ロックイン | Supabase は Vercel 非依存なので、DB 層のポータビリティは向上。Blob → Supabase Storage に将来的移行可能 |
| 5 | `proxy.ts.disabled` | Supabase Auth 導入時に、Session refresh 用の最小 matcher で `proxy.ts` を有効化する |

---

## 11. 推奨優先順位まとめ

```
【即対応】
  1. LICENSE 追加 (30分)
  2. Playwright 導入 (1日)

【Phase 1: 1〜2週間】 ★最優先
  3. Supabase 導入（ログイン任意 + お気に入り同期 + ゲスト維持のみ）

【Phase 2: 3〜4週間】
  4. SRS (SM-2) + /review/srs + 連続学習日数

【Phase 3: 2〜3週間】
  5. /dashboard + AI品質管理フロー

【Phase 4: 4〜6週間】
  6. パーソナライズ弱点分析 + ソーシャル機能
  7. オフライン同期
```

**期待効果**:
- 継続率（D7 Retention）+20〜30% 向上（SRS + リマインダー）
- ユーザーエンゲージメント時間 +50%（ダッシュボード + 弱点分析）
- AI 品質問題の早期発見 → クレーム対応コスト削減
- **追加月額コスト $0**（無料枠内）

---

## 付録 A: 推奨パッケージ追加

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "supabase": "^2.0.0"
  }
}
```

## 付録 B: 環境変数追加

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # サーバー専用・絶対に公開しない
```

## 付録 C: 参考ドキュメント

- [Supabase + Next.js 16 公式ガイド](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase RLS ポリシー書き方](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [SM-2 アルゴリズム原典](https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method)
- [Next.js 16 Server Actions + Supabase ベストプラクティス](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

*本提案書の内容は現状アーキテクチャ分析に基づく推奨案です。実装前にユーザー要件・トラフィック見積もり・コスト感度を再度確認してください。*
