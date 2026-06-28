-- Återställ — Supabase-schema. Kör i SQL Editor (eller via migrations).
-- Anonym auth: aktivera "Anonymous sign-ins" i Auth-inställningarna.

-- Profiler: premium-status sätts ENDAST av webhook (service role).
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  premium boolean not null default false,
  stripe_customer_id text,
  subscription_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_stripe_customer_idx
  on public.profiles (stripe_customer_id);

-- Incheckningar: en per användare och dag. Råa svar sparas för
-- mönsterinsikter (sömn vs status över tid).
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  status text not null check (status in ('redo', 'gransfall', 'vila')),
  somn int not null,
  trotthet int not null,
  belastning text not null check (belastning in ('tung', 'medel', 'latt')),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.profiles enable row level security;
alter table public.checkins enable row level security;

-- RLS: var och en ser/skriver bara sina egna rader. premium-kolumnen
-- skrivs av service role (bypassar RLS), aldrig av klienten.
drop policy if exists "egen profil läs" on public.profiles;
create policy "egen profil läs" on public.profiles
  for select using (auth.uid () = user_id);

drop policy if exists "egna incheckningar läs" on public.checkins;
create policy "egna incheckningar läs" on public.checkins
  for select using (auth.uid () = user_id);

drop policy if exists "egna incheckningar skriv" on public.checkins;
create policy "egna incheckningar skriv" on public.checkins
  for insert with check (auth.uid () = user_id);

drop policy if exists "egna incheckningar uppdatera" on public.checkins;
create policy "egna incheckningar uppdatera" on public.checkins
  for update using (auth.uid () = user_id);

-- Skapa profil-rad automatiskt vid ny användare.
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user ();

-- ============================================================================
-- Chunk B — Intäktsdatamodell (idempotenta tillägg)
-- Kör detta block separat om grundschemat redan finns i databasen.
-- ============================================================================

-- 1. Utöka profiles med fullständig prenumerationssanning
alter table public.profiles
  add column if not exists plan text,
  add column if not exists price_id text,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean default false,
  add column if not exists founding_member boolean default false,
  add column if not exists last_payment_status text,
  add column if not exists pause_until timestamptz;

-- 2. revenue_events: kanonisk logg för alla intäktshändelser
-- user_id är nullable — anonyma protokoll-köpare har inget auth.uid().
create table if not exists public.revenue_events (
  id uuid primary key default gen_random_uuid (),
  user_id uuid references auth.users (id) on delete set null,
  type text not null,
  source text,
  amount int,
  currency text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists revenue_events_type_created_idx
  on public.revenue_events (type, created_at desc);

alter table public.revenue_events enable row level security;

-- Klienten får insertera egna funnel-events (paywall_shown, checkout_started,
-- osv.) med sitt user_id, men kan aldrig läsa tabellen — analys sker via
-- service role. Anonyma events (bridge_offer_*) skrivs via /api/bridge-event
-- med service role.
drop policy if exists "egna revenue events skriv" on public.revenue_events;
create policy "egna revenue events skriv" on public.revenue_events
  for insert with check (auth.uid () = user_id);

-- 3. processed_events: idempotens för Stripe-webhook
-- Säkerställer att omsänt event aldrig dubbel-skriver till profiles/revenue_events.
create table if not exists public.processed_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

alter table public.processed_events enable row level security;
-- Inga klienträttigheter — enbart service role (webhook).

-- 4. push_subscriptions: PWA web-push (Chunk G)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "egna push-prenumerationer skriv" on public.push_subscriptions;
create policy "egna push-prenumerationer skriv" on public.push_subscriptions
  for insert with check (auth.uid () = user_id);

drop policy if exists "egna push-prenumerationer radera" on public.push_subscriptions;
create policy "egna push-prenumerationer radera" on public.push_subscriptions
  for delete using (auth.uid () = user_id);
