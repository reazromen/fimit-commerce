# External component review — 2026-11-26

This review evaluates external repositories for gaps in The FimiT. The selected
Scarpar fork remains the application foundation; these projects are integration
candidates, not replacement applications.

## Authentication and database

### Keep the official Supabase Docker deployment

Source: https://github.com/supabase/supabase/tree/master/docker

Reason: the application already depends on Supabase Auth, Postgres, PostgREST,
Storage, server/browser Supabase clients, SQL functions and RLS. Replacing Auth
alone with Auth.js, PocketBase or another starter would leave the data/API contract
incomplete and require a broader rewrite. Use a reviewed, pinned official Supabase
Compose release and apply this repository's migrations in order.

Reference starter: https://github.com/softechies/nextjs-supabase-saas-starter

Its organization/RLS tests and invite flows are useful reference material, but it
currently targets Next.js 16 while FimiT targets Next.js 15. Do not transplant its
application code wholesale. Port test cases/patterns only after comparing schemas.

## Bangladesh payments

Candidate: https://github.com/PrantaDas/banglapay

- MIT-licensed TypeScript package; package version reviewed: 1.0.2.
- Normalizes bKash Tokenized Checkout, Nagad and SSLCOMMERZ hosted checkout.
- Server-side only; Node 18+; no runtime dependencies.
- Exposes init, execute/query, refund and verification methods.
- Community-maintained and not an official provider SDK. Sandbox and live merchant
  verification remain mandatory before enabling any gateway.

Decision: evaluate as the preferred shared payment adapter after the core database
and order-payment lifecycle is running. Never mark an order paid based on a browser
redirect; query/verify with the provider and route the result through the existing
payment verification action. Provider credentials must be tenant-scoped and stored
server-side.

## Bangladesh couriers

Candidate: https://github.com/saizul/courier-bd-sdk

- MIT-licensed TypeScript package; version reviewed: 0.1.0; Node 22+; ESM-only.
- Pathao, Steadfast and RedX adapters, typed errors, input validation, token refresh,
  retry/backoff, webhook parsing, idempotent order creation and normalized statuses.
- The maintainer explicitly states the provider adapters are tested against mocked
  responses, not live courier APIs.

Decision: use as the primary integration candidate/reference for completing the
existing FimiT courier adapter contract, especially RedX and idempotent booking.
Keep all courier calls server-side, preserve per-organization credentials, and map
provider status transitions through FimiT's delivery state machine. Do not enable
live booking until merchant credentials and live test parcels are available.

Alternative reviewed: https://github.com/bytebrain3/RouteXpress

It advertises more courier coverage and webhook handlers, but its MIT LICENSE still
contains the placeholder copyright holder `[Your Name]`. Do not vendor or adopt it
until that provenance/licensing issue is resolved and source-level security review
is complete.

## Deployment decision

The current HServer is not a safe host for the full FimiT backend deployment:

- Root filesystem: 218 GB total, 198 GB used, 9.2 GB free (96%).
- RAM: 7.1 GiB total; about 2.7 GiB available at review time.
- The official Supabase Docker stack recommends 8 GB+ RAM and 80 GB+ SSD.
- HServer already runs unrelated services and owns the existing Caddy ingress.

Do not deploy another full Supabase stack on this host or expose database/internal
ports. The current FimiT container is a frontend preview only. Account creation
cannot work until real Supabase services, keys, migrations, public API hostname,
SMTP and persistent backups are configured.

Production deployment gate: dedicated Ubuntu VPS (recommended 4 vCPU, 8 GB RAM,
80 GB+ SSD), public app/API DNS, off-host backup destination, and merchant/provider
credentials for any live payment or courier integration.

## Explicitly not production-verified

- No candidate payment or courier SDK has been verified against live merchant
  accounts in this review.
- No payment/courier provider is enabled by installing a package alone.
- The SaaS starter is not a drop-in replacement for FimiT's schema or auth flow.
- This review does not change or apply production database migrations.
