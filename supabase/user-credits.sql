create table if not exists public.user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  free_credits integer not null default 100,
  paid_credits integer not null default 0,
  last_daily_refresh date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_user_credits_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_credits_updated_at on public.user_credits;
create trigger trg_user_credits_updated_at
before update on public.user_credits
for each row
execute function public.set_user_credits_updated_at();
