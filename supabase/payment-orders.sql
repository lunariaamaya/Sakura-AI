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
begin
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

  insert into private.user_credits (user_id, free_credits, paid_credits, last_daily_refresh)
  values (
    v_order.user_id,
    100,
    v_order.credits_to_grant,
    (now() at time zone 'utc')::date
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
