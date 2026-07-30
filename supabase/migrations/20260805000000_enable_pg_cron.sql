-- Aktifkan pg_cron dan jadwalkan enqueue_reminders() jalan tiap jam.
-- Sudah diterapkan ke proyek Supabase: jlcslhoptoqunsbojixy (2026-08-05)
create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

select cron.schedule('enqueue-reminders', '0 * * * *', 'select public.enqueue_reminders()');
