-- ============================================================
-- マイページ復習導線（ログイン必須）
--   - word_review_progress: お気に入り単語ごとの復習進捗（Leitner ボックス方式）
--   - learning_streaks    : 連続学習日数（1 ユーザー 1 行）
--
-- 前提: Phase 1（profiles / favorites）のマイグレーションが適用済みで、
--       公開関数 public.handle_updated_at() が存在すること。
--       __docs__/phase1-login-favorites-sync-setup.md §3-2 を参照。
-- ============================================================

-- 1. 復習進捗
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

-- 2. 連続学習日数
--    last_study_date は JST 基準の日付をクライアント側で算出して保存する。
--    サーバーの now()::date は UTC のため、日本時間 0:00〜9:00 の学習が
--    前日扱いになり連続日数が不当に途切れる。ここでは default を置かない。
create table if not exists public.learning_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_study_date date,
  current_streak int not null default 0 check (current_streak >= 0),
  best_streak int not null default 0 check (best_streak >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. RLS（favorites と同じく「自分の行のみ全操作可」）
alter table public.word_review_progress enable row level security;
alter table public.learning_streaks enable row level security;

drop policy if exists "own review progress" on public.word_review_progress;
create policy "own review progress" on public.word_review_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own learning streak" on public.learning_streaks;
create policy "own learning streak" on public.learning_streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. updated_at 自動更新（Phase 1 で作成済みの共通関数を再利用）
drop trigger if exists word_review_progress_updated_at on public.word_review_progress;
create trigger word_review_progress_updated_at before update on public.word_review_progress
  for each row execute function public.handle_updated_at();

drop trigger if exists learning_streaks_updated_at on public.learning_streaks;
create trigger learning_streaks_updated_at before update on public.learning_streaks
  for each row execute function public.handle_updated_at();
