-- Dukungan billing Mayar (bayar manual per bulan, bukan auto-recurring).
-- Sudah diterapkan ke proyek Supabase: jlcslhoptoqunsbojixy (2026-08-10)

alter table profiles add column plan_expires_at timestamptz;

create table payments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  plan             plan_type not null,
  amount           numeric(14,2) not null,
  mayar_link_id    text not null unique,
  mayar_checkout_url text,
  mayar_transaction_id text,
  status           text not null default 'pending' check (status in ('pending', 'paid', 'expired')),
  period_start     timestamptz,
  period_end       timestamptz,
  created_at       timestamptz not null default now(),
  paid_at          timestamptz
);

create index idx_payments_user on payments (user_id, created_at desc);
create index idx_payments_pending on payments (mayar_link_id) where status = 'pending';

alter table payments enable row level security;
create policy "own payments select" on payments for select using (user_id = auth.uid());
create policy "own payments insert" on payments for insert with check (user_id = auth.uid());

create or replace function expire_subscriptions() returns int
language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  update profiles set sub_status = 'past_due', updated_at = now()
  where plan in ('starter', 'pro')
    and sub_status = 'active'
    and plan_expires_at is not null
    and plan_expires_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end $$;

select cron.schedule('expire-subscriptions', '0 1 * * *', 'select expire_subscriptions()');
