-- Run this SQL in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Watch history table
create table if not exists watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  tmdb_id integer,
  title text,
  poster_path text,
  media_type text default 'movie',
  genre text,
  rating integer check (rating >= 1 and rating <= 5),
  mood text,
  review text,
  rewatch boolean default false,
  director text,
  country text,
  year integer,
  watched_at timestamp with time zone default now()
);

-- Badges table
create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  badge_id text not null,
  earned_at timestamp with time zone default now(),
  unique(user_id, badge_id)
);

-- Row Level Security (RLS) - Required for Supabase
alter table profiles enable row level security;
alter table watch_history enable row level security;
alter table user_badges enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own watch history" on watch_history for select using (auth.uid() = user_id);
create policy "Users can insert own watch history" on watch_history for insert with check (auth.uid() = user_id);
create policy "Users can delete own watch history" on watch_history for delete using (auth.uid() = user_id);
create policy "Users can update own watch history" on watch_history for update using (auth.uid() = user_id);

create policy "Users can view own badges" on user_badges for select using (auth.uid() = user_id);
create policy "Users can insert own badges" on user_badges for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
