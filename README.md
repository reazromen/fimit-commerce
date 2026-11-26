# The FimiT Commerce

Bangladesh-first, self-hosted, multi-tenant e-commerce SaaS. One application deployment serves independent merchant stores with their own admin accounts, catalogue, orders, branding and verified domains.

## Product scope

- Multi-tenant commerce with PostgreSQL Row-Level Security (RLS).
- Product catalogue, variants, inventory ledger, customers, discounts, cart, checkout and order lifecycle.
- Merchant admin, POS, reports, CMS page builder, receipts and delivery tracking.
- Bangladesh-first COD and manual MFS flows, district delivery zones, Bangla-ready invoices and courier adapter seams.
- Platform plans, trial/subscription records, invoices and custom-domain verification.
- Self-hosted application and data services; no production dependency on Vercel or hosted Supabase.

## Technology

Next.js 15, TypeScript, Tailwind CSS, Supabase-compatible APIs, PostgreSQL, Auth, PostgREST, Storage and Caddy.

## Repository origin and license

This project is derived from [sahol3/scarpar](https://github.com/sahol3/scarpar). The upstream MIT license is retained in [LICENSE](LICENSE). Preserve the original copyright and license notice in redistributed copies.

## Local development

1. Node.js 22+ and npm.
2. Install dependencies: `npm ci`.
3. Copy `.env.example` to `.env.local`.
4. Configure a Supabase-compatible project URL, anon key and server-only service-role key.
5. Optional: set `SUPABASE_INTERNAL_URL` to the private API gateway URL for server-side requests.
6. Apply migrations in order: `0001_core.sql` through `0005_platform_saas_domains.sql`.
7. Start: `npm run dev`.

## Self-hosted production

The production stack uses the official Supabase Docker Compose deployment plus the FimiT app and Caddy overlay:

- `deploy/bootstrap-supabase.sh` copies a pinned official Supabase Docker release.
- `deploy/supabase/docker-compose.fimit.yml` adds the app and reverse proxy and removes direct public access to the API gateway and pooler.
- `deploy/Dockerfile` builds the Next.js standalone runtime.
- `deploy/Caddyfile` provides HTTPS for the platform, API hostname and verified merchant domains.
- `docs/SELF_HOSTING.md` and `docs/deployment.md` contain the deployment and operational procedure.

Do not deploy the full production stack on the development HServer. Provision a dedicated VPS with the resources described in the self-hosting runbook.

## Quality gates

- `npm run typecheck`
- `npm run build`
- GitHub Actions CI can be added once the repository connection has workflow-write permission.
- Validate Compose with the official Supabase Compose file and FimiT overlay.
- Apply SQL migrations to a disposable PostgreSQL/Supabase test instance before production.
- Pass tenant-isolation, payment-webhook, domain-verification, backup-restore and load tests before onboarding paying merchants.

## Documentation

- [Implementation plan and repository audit](docs/FIMIT_IMPLEMENTATION_PLAN.md)
- [Self-hosting architecture](docs/SELF_HOSTING.md)
- [Deployment](docs/deployment.md)
- [Architecture](docs/architecture.md)
- [Operations runbook](docs/operations.md)

## Commercial offer

The initial acquisition offer is ৳1 development fee. Domain registration, hosting, third-party gateway fees, courier charges and optional customization/support are separate. Publish exact feature limits, renewal prices and support scope before accepting customers.
