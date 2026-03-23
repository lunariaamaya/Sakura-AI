create table if not exists public.payment_orders (
  paypal_order_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  sku text not null,
  kind text not null check (kind in ('credits_pack', 'subscription')),
  expected_amount numeric(12, 2) not null check (expected_amount > 0),
  expected_currency text not null default 'USD',
  credits_to_grant integer not null check (credits_to_grant > 0),
  status text not null default 'created' check (status in ('created', 'captured', 'completed', 'failed')),
  credits_granted boolean not null default false,
  paypal_custom_id text,
  paypal_capture_payload jsonb,
  paypal_event_payload jsonb,
  captured_at timestamptz,
  granted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscription_credit_schedules (
  id bigserial primary key,
  paypal_order_id text not null unique references public.payment_orders(paypal_order_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('pro', 'max')),
  sku text not null,
  period_days integer not null check (period_days > 0),
  total_credits integer not null check (total_credits > 0),
  immediate_credits integer not null check (immediate_credits >= 0),
  remaining_credits integer not null check (remaining_credits >= 0),
  daily_credits integer not null check (daily_credits >= 0),
  daily_extra_days integer not null check (daily_extra_days >= 0),
  released_daily_days integer not null default 0 check (released_daily_days >= 0),
  released_credits integer not null default 0 check (released_credits >= 0),
  total_cycles integer not null default 1 check (total_cycles > 0),
  cycle_days integer not null default 30 check (cycle_days > 0),
  starts_on date not null,
  ends_on date not null,
  next_release_on date not null,
  remaining_days integer not null default 0 check (remaining_days >= 0),
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_release_at timestamptz
);

alter table public.subscription_credit_schedules
  add column if not exists total_cycles integer not null default 1;
alter table public.subscription_credit_schedules
  add column if not exists cycle_days integer not null default 30;

create index if not exists idx_subscription_credit_schedules_user_plan
  on public.subscription_credit_schedules(user_id, plan, status);
create index if not exists idx_subscription_credit_schedules_release_on
  on public.subscription_credit_schedules(next_release_on, status);

create table if not exists public.user_subscription_status (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('pro', 'max')),
  sku text not null,
  effective_from date not null,
  effective_to date not null,
  remaining_days integer not null default 0 check (remaining_days >= 0),
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  source_paypal_order_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_subscription_status
  add column if not exists id bigserial;

update public.user_subscription_status
set id = nextval(pg_get_serial_sequence('public.user_subscription_status', 'id'))
where id is null;

alter table public.user_subscription_status
  alter column id set not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_subscription_status'::regclass
      and conname = 'user_subscription_status_pkey'
      and pg_get_constraintdef(oid) like '%(user_id, plan)%'
  ) then
    alter table public.user_subscription_status drop constraint user_subscription_status_pkey;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_subscription_status'::regclass
      and conname = 'user_subscription_status_pkey'
      and pg_get_constraintdef(oid) like '%(id)%'
  ) then
    alter table public.user_subscription_status add constraint user_subscription_status_pkey primary key (id);
  end if;
end
$$;

create unique index if not exists idx_user_subscription_status_source_order
  on public.user_subscription_status(source_paypal_order_id);
create index if not exists idx_user_subscription_status_user_plan_status
  on public.user_subscription_status(user_id, plan, status, effective_to desc, created_at desc);

create or replace function public.set_payment_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_payment_orders_updated_at on public.payment_orders;
create trigger trg_payment_orders_updated_at
before update on public.payment_orders
for each row
execute function public.set_payment_orders_updated_at();

drop trigger if exists trg_subscription_credit_schedules_updated_at on public.subscription_credit_schedules;
create trigger trg_subscription_credit_schedules_updated_at
before update on public.subscription_credit_schedules
for each row
execute function public.set_payment_orders_updated_at();

drop trigger if exists trg_user_subscription_status_updated_at on public.user_subscription_status;
create trigger trg_user_subscription_status_updated_at
before update on public.user_subscription_status
for each row
execute function public.set_payment_orders_updated_at();

alter table public.payment_orders enable row level security;
alter table public.subscription_credit_schedules enable row level security;
alter table public.user_subscription_status enable row level security;

revoke all on table public.payment_orders from public, anon, authenticated;
revoke all on table public.subscription_credit_schedules from public, anon, authenticated;
revoke all on table public.user_subscription_status from public, anon, authenticated;

grant all on table public.payment_orders to service_role, postgres;
grant all on table public.subscription_credit_schedules to service_role, postgres;
grant all on table public.user_subscription_status to service_role, postgres;

create or replace function public.apply_paypal_order_credit(
  p_paypal_order_id text,
  p_paypal_event_payload jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_order public.payment_orders%rowtype;
  v_total_credits integer;
  v_today date := (now() at time zone 'utc')::date;

  v_plan text;
  v_total_cycles integer;
  v_cycle_days integer := 30;
  v_period_days integer;

  v_cycle_total_credits integer;
  v_cycle_immediate_credits integer;
  v_cycle_remaining_credits integer;
  v_cycle_daily_credits integer;
  v_cycle_daily_extra_days integer;
  v_first_day_daily_credits integer;
  v_initial_grant_credits integer;
  v_effective_to date;
begin
  perform 1
  from information_schema.tables
  where table_schema = 'private' and table_name = 'user_credits';
  if not found then
    raise exception 'Missing table private.user_credits. Run supabase/user-credits.sql first.';
  end if;

  select *
  into v_order
  from public.payment_orders
  where paypal_order_id = p_paypal_order_id
  for update;

  if not found then
    raise exception 'Payment order not found: %', p_paypal_order_id;
  end if;

  if v_order.credits_granted then
    select free_credits + paid_credits
    into v_total_credits
    from private.user_credits
    where user_id = v_order.user_id;

    return jsonb_build_object(
      'granted', false,
      'reason', 'already_granted',
      'order_id', v_order.paypal_order_id,
      'total_credits', coalesce(v_total_credits, 0)
    );
  end if;

  if v_order.kind = 'subscription' then
    v_plan := case
      when v_order.sku like 'sub-pro-%' then 'pro'
      when v_order.sku like 'sub-max-%' then 'max'
      else null
    end;
    if v_plan is null then
      raise exception 'Unsupported subscription sku: %', v_order.sku;
    end if;

    v_total_cycles := case
      when v_order.sku like '%-yearly' then 12
      else 1
    end;
    v_period_days := v_total_cycles * v_cycle_days;
    v_effective_to := v_today + (v_period_days - 1);

    if mod(v_order.credits_to_grant, v_total_cycles) <> 0 then
      raise exception 'credits_to_grant % is not divisible by cycles %', v_order.credits_to_grant, v_total_cycles;
    end if;
    v_cycle_total_credits := v_order.credits_to_grant / v_total_cycles;

    v_cycle_immediate_credits := floor(v_cycle_total_credits * 0.4);
    v_cycle_remaining_credits := v_cycle_total_credits - v_cycle_immediate_credits;
    v_cycle_daily_credits := v_cycle_remaining_credits / v_cycle_days;
    v_cycle_daily_extra_days := mod(v_cycle_remaining_credits, v_cycle_days);
    v_first_day_daily_credits := v_cycle_daily_credits + case when v_cycle_daily_extra_days > 0 then 1 else 0 end;
    v_initial_grant_credits := v_cycle_immediate_credits + v_first_day_daily_credits;

    insert into private.user_credits (user_id, free_credits, paid_credits, last_daily_refresh)
    values (
      v_order.user_id,
      200,
      v_initial_grant_credits,
      v_today
    )
    on conflict (user_id)
    do update
      set paid_credits = private.user_credits.paid_credits + excluded.paid_credits;

    insert into public.subscription_credit_schedules (
      paypal_order_id,
      user_id,
      plan,
      sku,
      period_days,
      total_credits,
      immediate_credits,
      remaining_credits,
      daily_credits,
      daily_extra_days,
      released_daily_days,
      released_credits,
      total_cycles,
      cycle_days,
      starts_on,
      ends_on,
      next_release_on,
      remaining_days,
      status,
      last_release_at
    )
    values (
      v_order.paypal_order_id,
      v_order.user_id,
      v_plan,
      v_order.sku,
      v_period_days,
      v_order.credits_to_grant,
      v_cycle_immediate_credits,
      (v_cycle_remaining_credits * v_total_cycles),
      v_cycle_daily_credits,
      v_cycle_daily_extra_days,
      1,
      v_initial_grant_credits,
      v_total_cycles,
      v_cycle_days,
      v_today,
      v_effective_to,
      v_today + 1,
      greatest(v_period_days - 1, 0),
      case when v_period_days <= 1 then 'completed' else 'active' end,
      now()
    )
    on conflict (paypal_order_id)
    do nothing;

    insert into public.user_subscription_status (
      user_id,
      plan,
      sku,
      effective_from,
      effective_to,
      remaining_days,
      status,
      source_paypal_order_id
    )
    values (
      v_order.user_id,
      v_plan,
      v_order.sku,
      v_today,
      v_effective_to,
      greatest(v_period_days - 1, 0),
      case when v_period_days <= 1 then 'expired' else 'active' end,
      v_order.paypal_order_id
    )
    on conflict (source_paypal_order_id)
    do nothing;

    update public.payment_orders
    set
      status = 'completed',
      credits_granted = true,
      granted_at = now(),
      paypal_event_payload = coalesce(p_paypal_event_payload, paypal_event_payload)
    where paypal_order_id = v_order.paypal_order_id;

    select free_credits + paid_credits
    into v_total_credits
    from private.user_credits
    where user_id = v_order.user_id;

    return jsonb_build_object(
      'granted', true,
      'order_id', v_order.paypal_order_id,
      'user_id', v_order.user_id,
      'plan', v_plan,
      'cycle_days', v_cycle_days,
      'total_cycles', v_total_cycles,
      'effective_to', v_effective_to,
      'remaining_days', greatest(v_period_days - 1, 0),
      'cycle_immediate_credits', v_cycle_immediate_credits,
      'first_day_daily_credits', v_first_day_daily_credits,
      'added_credits', v_initial_grant_credits,
      'total_credits', coalesce(v_total_credits, 0)
    );
  end if;

  insert into private.user_credits (user_id, free_credits, paid_credits, last_daily_refresh)
  values (
    v_order.user_id,
    200,
    v_order.credits_to_grant,
    v_today
  )
  on conflict (user_id)
  do update
    set paid_credits = private.user_credits.paid_credits + excluded.paid_credits;

  update public.payment_orders
  set
    status = 'completed',
    credits_granted = true,
    granted_at = now(),
    paypal_event_payload = coalesce(p_paypal_event_payload, paypal_event_payload)
  where paypal_order_id = v_order.paypal_order_id;

  select free_credits + paid_credits
  into v_total_credits
  from private.user_credits
  where user_id = v_order.user_id;

  return jsonb_build_object(
    'granted', true,
    'order_id', v_order.paypal_order_id,
    'user_id', v_order.user_id,
    'added_credits', v_order.credits_to_grant,
    'total_credits', coalesce(v_total_credits, 0)
  );
end;
$$;

revoke all on function public.apply_paypal_order_credit(text,jsonb) from public, anon, authenticated;
grant execute on function public.apply_paypal_order_credit(text,jsonb) to service_role, postgres;

create or replace function public.release_subscription_daily_credits(
  p_now timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_today date := (p_now at time zone 'utc')::date;
  v_row public.subscription_credit_schedules%rowtype;

  v_next_release_on date;
  v_day_index integer;
  v_day_in_cycle integer;
  v_daily_credit integer;
  v_release_for_day integer;
  v_release_total integer;

  v_processed integer := 0;
  v_released_total integer := 0;
  v_new_remaining_days integer;
  v_new_status text;
begin
  for v_row in
    select *
    from public.subscription_credit_schedules
    where status = 'active'
      and next_release_on <= v_today
    for update
  loop
    v_next_release_on := v_row.next_release_on;
    v_day_index := v_row.released_daily_days;
    v_release_total := 0;

    while v_day_index < v_row.period_days and v_next_release_on <= v_today loop
      v_day_index := v_day_index + 1;
      v_day_in_cycle := ((v_day_index - 1) % v_row.cycle_days) + 1;
      v_daily_credit := v_row.daily_credits + case when v_day_in_cycle <= v_row.daily_extra_days then 1 else 0 end;
      v_release_for_day := v_daily_credit
        + case when v_row.total_cycles > 1 and v_day_in_cycle = 1 then v_row.immediate_credits else 0 end;
      v_release_total := v_release_total + v_release_for_day;
      v_next_release_on := v_next_release_on + 1;
    end loop;

    if v_release_total > 0 then
      insert into private.user_credits (user_id, free_credits, paid_credits, last_daily_refresh)
      values (
        v_row.user_id,
        200,
        v_release_total,
        v_today
      )
      on conflict (user_id)
      do update
        set paid_credits = private.user_credits.paid_credits + excluded.paid_credits;
    end if;

    v_new_remaining_days := greatest(v_row.period_days - v_day_index, 0);
    v_new_status := case when v_day_index >= v_row.period_days then 'completed' else 'active' end;

    update public.subscription_credit_schedules
    set
      released_daily_days = v_day_index,
      released_credits = released_credits + v_release_total,
      next_release_on = v_next_release_on,
      remaining_days = v_new_remaining_days,
      status = v_new_status,
      last_release_at = now()
    where id = v_row.id;

    update public.user_subscription_status
    set
      remaining_days = v_new_remaining_days,
      status = case when v_new_status = 'completed' then 'expired' else 'active' end,
      updated_at = now()
    where source_paypal_order_id = v_row.paypal_order_id;

    v_processed := v_processed + 1;
    v_released_total := v_released_total + v_release_total;
  end loop;

  return jsonb_build_object(
    'processed_schedules', v_processed,
    'released_credits', v_released_total,
    'run_date', v_today
  );
end;
$$;

revoke all on function public.release_subscription_daily_credits(timestamptz) from public, anon, authenticated;
grant execute on function public.release_subscription_daily_credits(timestamptz) to service_role, postgres;

create or replace function public.get_my_subscription_status()
returns table (
  plan text,
  sku text,
  effective_from date,
  effective_to date,
  remaining_days integer,
  status text
)
language sql
security definer
set search_path = public
as $$
  select
    s.plan,
    s.sku,
    s.effective_from,
    s.effective_to,
    s.remaining_days,
    s.status
  from public.user_subscription_status s
  where s.user_id = auth.uid()
  order by s.effective_to desc, s.created_at desc;
$$;

revoke all on function public.get_my_subscription_status() from public, anon;
grant execute on function public.get_my_subscription_status() to authenticated, service_role, postgres;
