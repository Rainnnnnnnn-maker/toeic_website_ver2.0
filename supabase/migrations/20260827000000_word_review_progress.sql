-- ============================================================
-- マイページ復習導線（ログイン必須）
--   - word_review_progress: お気に入り単語ごとの復習進捗（Leitner ボックス方式）
--   - learning_streaks    : 連続学習日数（1 ユーザー 1 行）
--
-- このファイル単体で完結し、何度実行しても同じ結果になる（冪等）。
-- 実行方法とトラブルシューティング: __docs__/mypage-review-flow-setup.md
-- ============================================================

-- ------------------------------------------------------------
-- 0. updated_at 自動更新の共通関数
--    Phase 1（profiles / favorites）で作成済みなら同じ内容で置き換わるだけ。
--    ここで定義しておくことで、Phase 1 の SQL の適用状況に依存しない。
-- ------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- 1. 復習進捗
-- ------------------------------------------------------------
create table if not exists public.word_review_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word_slug text not null,
  -- 0 = 未着手, 1..5 = Leitner のボックス（間隔 1/3/7/14/30 日）
  box smallint not null default 0 check (box between 0 and 5),
  review_count int not null default 0 check (review_count >= 0),
  forgot_count int not null default 0 check (forgot_count >= 0),
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, word_slug)
);

create index if not exists idx_word_review_progress_user_next
  on public.word_review_progress (user_id, next_review_at);

-- ------------------------------------------------------------
-- 2. 連続学習日数
--    last_study_date は JST 基準の日付をクライアント側で算出して保存する。
--    Postgres の now() は UTC のため、日本時間 0:00〜9:00 の学習が前日扱いになり
--    連続日数が不当に途切れる。よって default は置かない。
-- ------------------------------------------------------------
create table if not exists public.learning_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_study_date date,
  current_streak int not null default 0 check (current_streak >= 0),
  best_streak int not null default 0 check (best_streak >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. RLS（favorites と同じく「自分の行のみ全操作可」）
-- ------------------------------------------------------------
alter table public.word_review_progress enable row level security;
alter table public.learning_streaks enable row level security;

drop policy if exists "own review progress" on public.word_review_progress;
create policy "own review progress" on public.word_review_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own learning streak" on public.learning_streaks;
create policy "own learning streak" on public.learning_streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. updated_at トリガー
-- ------------------------------------------------------------
drop trigger if exists word_review_progress_updated_at on public.word_review_progress;
create trigger word_review_progress_updated_at before update on public.word_review_progress
  for each row execute function public.handle_updated_at();

drop trigger if exists learning_streaks_updated_at on public.learning_streaks;
create trigger learning_streaks_updated_at before update on public.learning_streaks
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------
-- 5. Data API（PostgREST）経由のアクセス権
--    新しめの Supabase プロジェクトでは public スキーマの新規テーブルが
--    自動公開されない。RLS があっても GRANT が無いと 42501 になるため明示する。
--    行の絞り込みは RLS が担当するので、対象はログイン済みロールだけでよい。
-- ------------------------------------------------------------
grant select, insert, update, delete on public.word_review_progress to authenticated;
grant select, insert, update, delete on public.learning_streaks to authenticated;
