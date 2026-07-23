create table if not exists public.competition_event (
  id text primary key,
  event jsonb not null,
  settings jsonb not null default '{"darkMode": false, "autoSave": true, "defaultSceneDuration": 5}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.competition_event enable row level security;

drop policy if exists "Public can read competition event" on public.competition_event;
create policy "Public can read competition event"
on public.competition_event
for select
to anon, authenticated
using (id = 'default');

drop policy if exists "Public can create competition event" on public.competition_event;
create policy "Public can create competition event"
on public.competition_event
for insert
to anon, authenticated
with check (id = 'default');

drop policy if exists "Public can update competition event" on public.competition_event;
create policy "Public can update competition event"
on public.competition_event
for update
to anon, authenticated
using (id = 'default')
with check (id = 'default');

drop policy if exists "Public can delete competition event" on public.competition_event;
create policy "Public can delete competition event"
on public.competition_event
for delete
to anon, authenticated
using (id = 'default');

grant select, insert, update, delete on table public.competition_event to anon, authenticated;
