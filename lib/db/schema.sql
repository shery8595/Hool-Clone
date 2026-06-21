-- HoolClone core schema (M2 + M3)

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique,
  display_name text,
  public_slug text unique,
  memwal_namespace text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists fan_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  favorite_team text,
  rival_team text,
  preferred_style text,
  tone text not null default 'playful',
  clone_maturity integer not null default 0,
  public_enabled boolean not null default false,
  summary text,
  onboarding_complete boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  question_id text not null,
  answer_text text not null,
  driver text,
  extracted_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  memory_type text not null default 'remembered',
  text text not null,
  metadata jsonb not null default '{}',
  storage_status text not null default 'stored',
  public_visible boolean not null default true,
  question_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_memories_user_id on memories(user_id);
create index if not exists idx_onboarding_answers_user_id on onboarding_answers(user_id);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  external_id text unique not null,
  match_number integer not null,
  tournament_stage text not null,
  group_code text,
  team_a_code text,
  team_b_code text,
  matchup_label text,
  venue text not null,
  city text not null,
  kickoff_at timestamptz not null,
  status text not null default 'scheduled',
  score_a integer,
  score_b integer,
  winner text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_matches_external_id on matches(external_id);
create index if not exists idx_matches_kickoff on matches(kickoff_at);

create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  predicted_winner text not null,
  predicted_score_a integer not null,
  predicted_score_b integer not null,
  confidence integer not null check (confidence between 1 and 100),
  reasoning text,
  emotional_state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index if not exists idx_predictions_user_id on predictions(user_id);
create index if not exists idx_predictions_match_id on predictions(match_id);

create table if not exists clone_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  predicted_winner text not null,
  predicted_score_a integer not null,
  predicted_score_b integer not null,
  confidence integer not null check (confidence between 1 and 100),
  reasoning text not null,
  insight text,
  memory_receipts jsonb not null default '[]',
  raw_llm_output jsonb,
  training_question text,
  clone_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index if not exists idx_clone_predictions_user_id on clone_predictions(user_id);

create table if not exists telegram_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  chat_id bigint not null,
  notifications_enabled boolean not null default false,
  pending_wallet text,
  pending_challenge_token text,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, chat_id)
);

create index if not exists idx_telegram_chats_chat_id on telegram_chats(chat_id);

create table if not exists telegram_live_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  score_a integer not null,
  score_b integer not null,
  scoring_team_code text,
  occurred_at timestamptz not null default now(),
  unique (match_id, score_a, score_b)
);

create index if not exists idx_telegram_live_events_match_id on telegram_live_events(match_id);

create table if not exists telegram_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  chat_id bigint not null,
  match_id uuid references matches(id) on delete set null,
  message_type text not null,
  body text not null,
  metadata jsonb not null default '{}',
  telegram_message_id bigint,
  sent_at timestamptz not null default now()
);

create index if not exists idx_telegram_messages_user_id on telegram_messages(user_id);
create index if not exists idx_telegram_messages_sent_at on telegram_messages(sent_at desc);
