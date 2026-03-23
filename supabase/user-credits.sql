create schema if not exists private;

create table if not exists private.user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  free_credits integer not null default 200,
  paid_credits integer not null default 0,
  last_daily_refresh date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private.user_credits
  alter column free_credits set default 200;

create or replace function public.set_user_credits_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_credits_updated_at on private.user_credits;
create trigger trg_user_credits_updated_at
before update on private.user_credits
for each row
execute function public.set_user_credits_updated_at();

create or replace function public.init_user_credits_on_signup()
returns trigger
language plpgsql
security definer
set search_path = private, public
as $$
begin
  insert into private.user_credits (user_id, free_credits, paid_credits, last_daily_refresh)
  values (new.id, 200, 0, (now() at time zone 'utc')::date)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_auth_user_init_credits on auth.users;
create trigger trg_auth_user_init_credits
after insert on auth.users
for each row
execute function public.init_user_credits_on_signup();
