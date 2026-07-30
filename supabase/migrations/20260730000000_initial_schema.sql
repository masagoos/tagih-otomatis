-- ============================================================
-- SKEMA DATABASE MVP: Tagih Otomatis via WhatsApp untuk UMKM
-- Sudah diterapkan ke proyek Supabase: jlcslhoptoqunsbojixy
-- (migrasi: initial_schema_tagih_otomatis, 2026-07-30)
-- ============================================================

create type invoice_status as enum ('unpaid', 'paid', 'overdue', 'cancelled');
create type message_status as enum ('queued', 'sent', 'delivered', 'failed', 'cancelled');
create type device_status  as enum ('disconnected', 'connected', 'banned');
create type plan_type      as enum ('trial', 'starter', 'pro');
create type sub_status     as enum ('active', 'past_due', 'suspended', 'cancelled');

-- 1. PROFILES — data pemilik akun (extend auth.users)
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  owner_name    text not null,
  phone         text not null,
  plan          plan_type not null default 'trial',
  sub_status    sub_status not null default 'active',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  mayar_customer_id     text,
  mayar_subscription_id text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. WA_DEVICES — nomor WA pengirim (via Fonnte)
create table wa_devices (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  phone_number   text not null,
  provider       text not null default 'fonnte',
  api_token      text not null,
  status         device_status not null default 'disconnected',
  last_checked_at timestamptz,
  created_at     timestamptz not null default now(),
  unique (user_id, phone_number)
);

-- 3. CONTACTS — pelanggan si UMKM (pihak yang ditagih)
create table contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  name       text not null,
  phone      text not null,
  notes      text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, phone)
);

-- 4. MESSAGE_TEMPLATES — variabel: {{nama}} {{jumlah}} {{jatuh_tempo}} {{invoice}} {{usaha}}
create table message_templates (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  name       text not null,
  body       text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- 5. REMINDER_RULES — offset_days: -3 = H-3, 0 = hari H, 3 = H+3
create table reminder_rules (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  offset_days int  not null,
  template_id uuid not null references message_templates(id) on delete restrict,
  send_hour   int  not null default 9 check (send_hour between 6 and 21),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (user_id, offset_days)
);

-- 6. INVOICES
create table invoices (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  contact_id     uuid not null references contacts(id) on delete restrict,
  invoice_number text not null,
  amount         numeric(14,2) not null check (amount > 0),
  due_date       date not null,
  status         invoice_status not null default 'unpaid',
  description    text,
  paid_at        timestamptz,
  paid_amount    numeric(14,2),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, invoice_number)
);

create index idx_invoices_user_status on invoices (user_id, status);
create index idx_invoices_due on invoices (due_date) where status in ('unpaid', 'overdue');

-- 7. MESSAGES — outbox + log pesan WA (body = snapshot hasil render)
create table messages (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles(id) on delete cascade,
  invoice_id        uuid not null references invoices(id) on delete cascade,
  reminder_rule_id  uuid references reminder_rules(id) on delete set null,
  device_id         uuid references wa_devices(id) on delete set null,
  to_phone          text not null,
  body              text not null,
  scheduled_at      timestamptz not null,
  sent_at           timestamptz,
  status            message_status not null default 'queued',
  provider_msg_id   text,
  error_detail      text,
  created_at        timestamptz not null default now(),
  unique (invoice_id, reminder_rule_id)
);

create index idx_messages_due on messages (scheduled_at) where status = 'queued';
create index idx_messages_user_month on messages (user_id, sent_at);

-- 8. PLAN_LIMITS
create table plan_limits (
  plan            plan_type primary key,
  monthly_messages int not null,
  max_devices      int not null
);
insert into plan_limits values
  ('trial', 50, 1),
  ('starter', 200, 1),
  ('pro', 1000, 3);

-- 9. WEBHOOK_EVENTS — log mentah webhook (Mayar & Fonnte), dedup via external_id
create table webhook_events (
  id           uuid primary key default gen_random_uuid(),
  source       text not null,
  external_id  text,
  payload      jsonb not null,
  processed_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (source, external_id)
);

-- RLS — multi-tenant
alter table profiles          enable row level security;
alter table wa_devices        enable row level security;
alter table contacts          enable row level security;
alter table message_templates enable row level security;
alter table reminder_rules    enable row level security;
alter table invoices          enable row level security;
alter table messages          enable row level security;
alter table webhook_events    enable row level security; -- tanpa policy = hanya service_role
alter table plan_limits       enable row level security;

create policy "own profile"   on profiles          for all using (id = auth.uid());
create policy "own devices"   on wa_devices        for all using (user_id = auth.uid());
create policy "own contacts"  on contacts          for all using (user_id = auth.uid());
create policy "own templates" on message_templates for all using (user_id = auth.uid());
create policy "own rules"     on reminder_rules    for all using (user_id = auth.uid());
create policy "own invoices"  on invoices          for all using (user_id = auth.uid());
create policy "own messages"  on messages          for all using (user_id = auth.uid());
create policy "read plan limits" on plan_limits    for select using (true);

-- FUNGSI PENJADWAL — dipanggil pg_cron tiap jam
create or replace function enqueue_reminders() returns int
language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  insert into messages (user_id, invoice_id, reminder_rule_id, device_id, to_phone, body, scheduled_at)
  select
    i.user_id, i.id, r.id, d.id, c.phone,
    replace(replace(replace(replace(replace(t.body,
      '{{nama}}', c.name),
      '{{jumlah}}', to_char(i.amount, 'FM999G999G999')),
      '{{jatuh_tempo}}', to_char(i.due_date, 'DD Mon YYYY')),
      '{{invoice}}', i.invoice_number),
      '{{usaha}}', p.business_name),
    ((i.due_date + r.offset_days)::timestamp + make_interval(hours => r.send_hour))
      at time zone 'Asia/Jakarta'
  from invoices i
  join contacts c         on c.id = i.contact_id and c.is_active
  join reminder_rules r   on r.user_id = i.user_id and r.is_active
  join message_templates t on t.id = r.template_id
  join profiles p         on p.id = i.user_id and p.sub_status = 'active'
  join wa_devices d       on d.user_id = i.user_id and d.status = 'connected'
  where i.status in ('unpaid', 'overdue')
    and (i.due_date + r.offset_days) = (now() at time zone 'Asia/Jakarta')::date
  on conflict (invoice_id, reminder_rule_id) do nothing;
  get diagnostics v_count = row_count;

  update invoices set status = 'overdue', updated_at = now()
  where status = 'unpaid' and due_date < (now() at time zone 'Asia/Jakarta')::date;

  return v_count;
end $$;

-- Aktifkan pg_cron (Dashboard > Database > Extensions), lalu:
-- select cron.schedule('enqueue-reminders', '0 * * * *', 'select enqueue_reminders()');

-- VIEW LAPORAN dashboard
create view v_dashboard with (security_invoker = true) as
select
  i.user_id,
  count(*) filter (where i.status = 'unpaid')  as unpaid_count,
  count(*) filter (where i.status = 'overdue') as overdue_count,
  coalesce(sum(i.amount) filter (where i.status in ('unpaid','overdue')), 0) as outstanding_amount,
  coalesce(sum(i.paid_amount) filter (where i.status = 'paid'
    and i.paid_at >= date_trunc('month', now())), 0) as collected_this_month
from invoices i
group by i.user_id;
