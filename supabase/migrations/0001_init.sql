-- 행복지뢰 1단계 DB
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여넣고 Run 하세요.

-- ============ 1. 프로필 ============
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  nickname      text check (char_length(nickname) <= 20),
  random_start  time not null default '10:00',   -- 랜덤 시간 기본 범위 (한국 시간)
  random_end    time not null default '21:00',
  created_at    timestamptz not null default now(),
  check (random_start < random_end)
);

-- 회원가입하면 프로필 자동 생성
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ 2. 추천 미션 (앱 업데이트 없이 DB에서 추가) ============
create table public.mission_suggestions (
  id          bigint generated always as identity primary key,
  title       text not null,
  emoji       text,
  description text,
  is_active   boolean not null default true,   -- false 면 앱에서 숨김
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ============ 3. 행복지뢰 ============
create table public.mines (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid()
                   references auth.users(id) on delete cascade,
  content        text not null check (char_length(content) between 1 and 100),
  suggestion_id  bigint references public.mission_suggestions(id) on delete set null,
  scheduled_at   timestamptz not null,                 -- 터지는 시각
  time_mode      text not null check (time_mode in ('manual', 'random')),
  hide_time      boolean not null default false,
  hide_content   boolean not null default false,
  completed_at   timestamptz,                          -- null 이면 미완료
  mood_emoji     text check (char_length(mood_emoji) <= 16),
  mood_note      text check (char_length(mood_note) <= 500),
  created_at     timestamptz not null default now()
);

create index mines_user_scheduled_idx on public.mines (user_id, scheduled_at);

-- ============ 4. RLS: 내 데이터는 나만 ============
alter table public.profiles            enable row level security;
alter table public.mines               enable row level security;
alter table public.mission_suggestions enable row level security;

create policy "내 프로필 보기" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "내 프로필 수정" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "내 지뢰 보기" on public.mines
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "내 지뢰 심기" on public.mines
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "내 지뢰 완료/기분 기록" on public.mines
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- 완료한 지뢰는 삭제할 수 없어요 (기록과 나무 보호)
create policy "완료 전 지뢰만 삭제" on public.mines
  for delete to authenticated
  using ((select auth.uid()) = user_id and completed_at is null);

-- 심은 뒤 내용/시간/숨김은 못 바꾸고, 완료 시각과 기분 기록만 바꿀 수 있게
revoke update on public.mines from anon, authenticated;
grant update (completed_at, mood_emoji, mood_note) on public.mines to authenticated;

-- 추천 미션: 로그인한 사람은 읽기만 가능
create policy "추천 미션 보기" on public.mission_suggestions
  for select to authenticated using (is_active);

-- ============ 5. 앱 안에서 회원 탈퇴 ============
-- auth.users 에서 지우면 profiles, mines 도 cascade 로 함께 삭제돼요
create function public.delete_my_account()
returns void language plpgsql security definer set search_path = ''
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant  execute on function public.delete_my_account() to authenticated;
