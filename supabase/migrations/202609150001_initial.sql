begin;
create extension if not exists pgcrypto;

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.sessions (id uuid primary key, user_id uuid not null references public.profiles(id) on delete cascade, device_id text not null, mode text not null, territory text not null, started_at timestamptz not null, ended_at timestamptz, status text not null, summary jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table public.attempts (id uuid primary key, user_id uuid not null references public.profiles(id) on delete cascade, session_id uuid references public.sessions(id) on delete cascade, content_id text not null, content_type text not null, dimension text, correct boolean not null, response_ms integer, occurred_at timestamptz not null, evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table public.user_mastery (user_id uuid not null references public.profiles(id) on delete cascade, content_id text not null, content_type text not null, dimensions jsonb not null default '{}'::jsonb, retention_state text not null default 'encountered', first_seen_at timestamptz, last_seen_at timestamptz, last_correct_at timestamptz, next_review_at timestamptz, evidence_version bigint not null default 0, updated_at timestamptz not null default now(), primary key(user_id,content_id,content_type));
create table public.unlocks (user_id uuid not null references public.profiles(id) on delete cascade, unlock_id text not null, unlocked_at timestamptz not null, evidence jsonb not null default '{}'::jsonb, primary key(user_id,unlock_id));
create table public.records (user_id uuid not null references public.profiles(id) on delete cascade, record_id text not null, value numeric not null, achieved_at timestamptz not null, evidence jsonb not null default '{}'::jsonb, verified boolean not null default false, primary key(user_id,record_id));
create table public.achievements (user_id uuid not null references public.profiles(id) on delete cascade, achievement_id text not null, achieved_at timestamptz not null, evidence jsonb not null default '{}'::jsonb, primary key(user_id,achievement_id));
create table public.curses (user_id uuid not null references public.profiles(id) on delete cascade, content_id text not null, content_type text not null, started_at timestamptz not null, broken_at timestamptz, evidence jsonb not null default '{}'::jsonb, primary key(user_id,content_id,content_type));
create table public.nemeses (user_id uuid not null references public.profiles(id) on delete cascade, content_id text not null, content_type text not null, mode text not null, run_deaths integer not null default 0, total_errors integer not null default 0, first_at timestamptz not null, last_at timestamptz not null, primary key(user_id,content_id,content_type,mode));
create table public.graveyard (id uuid primary key, user_id uuid not null references public.profiles(id) on delete cascade, content_id text not null, content_type text not null, mode text not null, run_id uuid, run_length bigint not null default 0, died_at timestamptz not null, detail jsonb not null default '{}'::jsonb);
create table public.user_settings (user_id uuid not null references public.profiles(id) on delete cascade, setting_key text not null, value jsonb not null, revision bigint not null default 1, updated_at timestamptz not null default now(), primary key(user_id,setting_key));
create table public.content_versions (provider text not null, version text not null, checksum text, released_at timestamptz, metadata jsonb not null default '{}'::jsonb, primary key(provider,version));
create table public.sync_receipts (operation_id uuid primary key, user_id uuid not null references public.profiles(id) on delete cascade, entity_kind text not null, entity_id text not null, applied_at timestamptz not null default now());

create index attempts_user_time_idx on public.attempts(user_id,occurred_at desc);create index attempts_user_content_idx on public.attempts(user_id,content_id,content_type);create index sessions_user_time_idx on public.sessions(user_id,started_at desc);create index mastery_user_review_idx on public.user_mastery(user_id,next_review_at);create index graveyard_user_time_idx on public.graveyard(user_id,died_at desc);

create or replace function public.create_profile_for_user() returns trigger language plpgsql security definer set search_path=public as $$begin insert into public.profiles(id) values(new.id) on conflict do nothing;return new;end$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_user();

alter table public.profiles enable row level security;alter table public.sessions enable row level security;alter table public.attempts enable row level security;alter table public.user_mastery enable row level security;alter table public.unlocks enable row level security;alter table public.records enable row level security;alter table public.achievements enable row level security;alter table public.curses enable row level security;alter table public.nemeses enable row level security;alter table public.graveyard enable row level security;alter table public.user_settings enable row level security;alter table public.sync_receipts enable row level security;
create policy own_profiles on public.profiles for all using(id=auth.uid()) with check(id=auth.uid());
create policy own_sessions on public.sessions for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_attempts on public.attempts for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_mastery on public.user_mastery for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_unlocks on public.unlocks for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_records on public.records for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_achievements on public.achievements for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_curses on public.curses for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_nemeses on public.nemeses for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_graveyard on public.graveyard for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_settings on public.user_settings for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_receipts on public.sync_receipts for select using(user_id=auth.uid());
grant select on public.content_versions to anon,authenticated;
commit;
