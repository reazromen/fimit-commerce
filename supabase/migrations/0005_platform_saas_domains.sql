-- 0005_platform_saas_domains.sql
-- The FimiT SaaS control plane: plans, subscriptions, invoices and verified custom domains.
-- Existing organizations are grandfathered as active; newly created organizations receive a 14-day trial.

begin;

create table if not exists public.platform_plans (
  id uuid primary key default gen_random_uuid(),
  plan_key text not null unique,
  name text not null,
  description text,
  price_paisa bigint not null default 0 check (price_paisa >= 0),
  billing_interval text not null default 'yearly' check (billing_interval in ('monthly','yearly')),
  trial_days int not null default 14 check (trial_days >= 0),
  limits jsonb not null default '{}'::jsonb,
  available_modules text[] not null default '{}'::text[],
  is_active boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Draft launch prices/limits: confirm commercially before publishing a pricing page.
insert into public.platform_plans (plan_key, name, description, price_paisa, billing_interval, trial_days, limits, available_modules, position)
values
  ('starter', 'Starter', 'For a new online business', 150000, 'yearly', 14,
   '{"max_products":100,"max_orders_per_month":500,"max_storage_mb":2048,"max_staff":2,"max_custom_domains":1}'::jsonb,
   array['catalog','orders','customers','discounts','delivery','receipts','cms','storefront','reports','expenses']::text[], 1),
  ('business', 'Business', 'For growing online stores', 250000, 'yearly', 14,
   '{"max_products":500,"max_orders_per_month":2500,"max_storage_mb":10240,"max_staff":5,"max_custom_domains":1}'::jsonb,
   array['catalog','orders','pos','customers','discounts','delivery','receipts','cms','storefront','reports','expenses','reviews']::text[], 2),
  ('growth', 'Growth', 'For established commerce teams', 450000, 'yearly', 14,
   '{"max_products":2000,"max_orders_per_month":10000,"max_storage_mb":51200,"max_staff":15,"max_custom_domains":3}'::jsonb,
   array['catalog','orders','pos','customers','discounts','delivery','receipts','cms','storefront','reports','expenses','reviews']::text[], 3)
on conflict (plan_key) do update set
  name = excluded.name, description = excluded.description, price_paisa = excluded.price_paisa,
  billing_interval = excluded.billing_interval, trial_days = excluded.trial_days,
  limits = excluded.limits, available_modules = excluded.available_modules,
  is_active = true, position = excluded.position, updated_at = now();

alter table public.orgs
  add column if not exists plan_key text references public.platform_plans(plan_key),
  add column if not exists subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing','active','past_due','suspended','cancelled')),
  add column if not exists trial_ends_at timestamptz default (now() + interval '14 days'),
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists grace_period_end timestamptz;

-- Existing organizations must not be unexpectedly suspended by this migration.
update public.orgs
set plan_key = coalesce(plan_key, 'starter'),
    subscription_status = 'active',
    trial_ends_at = null
where created_at < now();

alter table public.orgs alter column plan_key set default 'starter';
alter table public.orgs alter column plan set default 'starter';
update public.orgs set plan = plan_key where plan is null or plan = 'free';

create table if not exists public.platform_subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null unique references public.orgs(id) on delete cascade,
  plan_key text not null references public.platform_plans(plan_key),
  status text not null default 'trialing'
    check (status in ('trialing','active','past_due','suspended','cancelled')),
  billing_interval text not null default 'yearly' check (billing_interval in ('monthly','yearly')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  grace_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  provider text check (provider in ('manual','bkash','nagad','sslcommerz','aamarpay','shurjopay')),
  provider_customer_ref text,
  provider_subscription_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_subscriptions_status_period_idx
  on public.platform_subscriptions(status, current_period_end);

-- Keep the org row's fast-read billing fields synchronized with the subscription source of truth.
create or replace function public.sync_org_subscription_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orgs
  set plan_key = new.plan_key,
      plan = new.plan_key,
      subscription_status = new.status,
      trial_ends_at = new.trial_ends_at,
      current_period_start = new.current_period_start,
      current_period_end = new.current_period_end,
      grace_period_end = new.grace_period_end,
      updated_at = now()
  where id = new.org_id;
  return new;
end;
$$;

drop trigger if exists platform_subscriptions_sync_org on public.platform_subscriptions;
create trigger platform_subscriptions_sync_org
  after insert or update on public.platform_subscriptions
  for each row execute function public.sync_org_subscription_fields();

-- Create the subscription record atomically with every new tenant.
create or replace function public.create_platform_subscription_for_org()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.platform_subscriptions (org_id, plan_key, status, billing_interval, trial_ends_at)
  values (new.id, coalesce(new.plan_key, 'starter'), 'trialing', 'yearly', new.trial_ends_at)
  on conflict (org_id) do nothing;
  return new;
end;
$$;

drop trigger if exists orgs_create_platform_subscription on public.orgs;
create trigger orgs_create_platform_subscription
  after insert on public.orgs
  for each row execute function public.create_platform_subscription_for_org();

-- Backfill existing tenants as active/grandfathered subscriptions without an expiry date.
insert into public.platform_subscriptions (org_id, plan_key, status, billing_interval, current_period_start, current_period_end)
select id, coalesce(plan_key, 'starter'), 'active', 'yearly', null, null
from public.orgs
on conflict (org_id) do nothing;

create table if not exists public.platform_invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  subscription_id uuid references public.platform_subscriptions(id) on delete set null,
  invoice_no text not null unique,
  amount_paisa bigint not null check (amount_paisa >= 0),
  currency char(3) not null default 'BDT',
  status text not null default 'pending' check (status in ('draft','pending','paid','void','overdue','refunded')),
  payment_method text check (payment_method in ('manual','bkash','nagad','sslcommerz','aamarpay','shurjopay','bank')),
  provider text,
  provider_reference text,
  description text,
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_invoices_org_created_idx
  on public.platform_invoices(org_id, created_at desc);

create table if not exists public.platform_payment_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  invoice_id uuid references public.platform_invoices(id) on delete set null,
  provider text not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, event_id)
);

create table if not exists public.custom_domains (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  hostname text not null check (hostname = lower(hostname)),
  status text not null default 'pending' check (status in ('pending','verified','disabled')),
  verification_token text not null default encode(gen_random_bytes(24), 'hex'),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(org_id, hostname)
);

create unique index if not exists custom_domains_hostname_unique on public.custom_domains(hostname);
create index if not exists custom_domains_org_idx on public.custom_domains(org_id);
create index if not exists custom_domains_verified_host_idx on public.custom_domains(hostname) where status = 'verified';

alter table public.platform_plans enable row level security;
alter table public.platform_subscriptions enable row level security;
alter table public.platform_invoices enable row level security;
alter table public.platform_payment_events enable row level security;
alter table public.custom_domains enable row level security;

create policy platform_plans_public_active_select on public.platform_plans
  for select to anon, authenticated using (is_active = true);
create policy platform_plans_platform_admin_all on public.platform_plans
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy platform_subscriptions_select_members on public.platform_subscriptions
  for select to authenticated using (public.is_org_member(org_id));
create policy platform_invoices_select_members on public.platform_invoices
  for select to authenticated using (public.is_org_member(org_id));

create policy custom_domains_select_members on public.custom_domains
  for select to authenticated using (public.is_org_member(org_id));
create policy custom_domains_write_owner_admin on public.custom_domains
  for all to authenticated
  using (public.has_org_role(org_id, array['owner','admin']::text[]))
  with check (public.has_org_role(org_id, array['owner','admin']::text[]));

-- Public host resolution exposes only the active store slug, never the verification token or domain row.
create or replace function public.resolve_store_domain(p_hostname text)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select o.slug
  from public.custom_domains d
  join public.orgs o on o.id = d.org_id
  where d.hostname = lower(trim(p_hostname))
    and d.status = 'verified'
    and o.is_active = true
  limit 1;
$$;

revoke all on function public.resolve_store_domain(text) from public;
grant execute on function public.resolve_store_domain(text) to anon, authenticated;

commit;