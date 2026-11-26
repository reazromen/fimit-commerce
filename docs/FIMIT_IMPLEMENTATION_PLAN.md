# The FimiT Commerce — implementation plan

Status: active build plan. Date: 2026-11-26.
Base: fork of sahol3/scarpar, upstream commit 16a1c8d, MIT license.

## Product objective

Build a Bangladesh-first, self-hosted, multi-tenant commerce SaaS. One application deployment serves independently branded merchant stores. Each merchant gets a storefront, admin, catalogue, inventory, orders, payment settings, courier settings, delivery zones, reports and domain mapping.

Initial commercial offer: ৳1 development fee; domain, hosting and third-party provider fees are paid separately by the merchant. This offer must be bounded by a published feature and support scope.

## Repository selection audit

### Selected: Scarpar

Why: the code already contains organization tenancy, PostgreSQL RLS, commerce catalogue, variants, inventory ledger, customer/order lifecycle, COD, manual MFS verification, district delivery zones, POS, CMS blocks, Bangla-ready receipts and courier adapter seams. Its MIT license permits commercial modification and self-hosting with the notice retained.

Risk: this is a young repository with a small commit history and low public adoption. The README and roadmap are not proof of production readiness. The feature inventory reports important gaps: the initial custom-domain slice is now implemented but production TLS is unverified, no platform billing enforcement yet, incomplete payment/webhook flows, no live SMS/email driver, and missing public CMS slug routing and password-reset completion.

### Rejected as primary base: Bagisto

Bagisto is a mature MIT-licensed Laravel commerce engine. The audited 2.5 branch composer manifest requires PHP ^8.4 and Laravel ^13. It does not provide the complete multi-tenant SaaS and Bangladesh operations scope required here without substantial additional engineering. Keep it as a reference/alternative, not a second runtime.

### Supporting reference: tenancy/tenancy

The Laravel tenancy package is MIT and supports Laravel 10–13, but it is a tenancy framework, not a ready-made commerce product. It is not needed in the selected Next.js/Postgres architecture.

## Target architecture

- Next.js application, TypeScript and server-side actions.
- Self-hosted Supabase-compatible stack on our own VPS: PostgreSQL, Auth, PostgREST, Storage and API gateway. Use the official Supabase Docker deployment, not the local-development CLI stack.
- PostgreSQL RLS remains the primary tenant data boundary. Application checks are additional controls, never a substitute for RLS.
- Redis for rate limits, short-lived cache, idempotency and background jobs where required.
- S3-compatible object storage or self-hosted Supabase Storage for merchant media. Media backups must be independent from database backups.
- Nginx/Caddy reverse proxy, TLS, Cloudflare DNS/CDN where configured, wildcard storefront host routing and custom-domain verification.
- One modular monolith initially. Do not split into microservices before measurements justify it.

## Bangladesh requirements

Payments: COD, manual bKash/Nagad/Rocket/Upay instructions with transaction-reference verification, plus provider-backed bKash Checkout, Nagad, SSLCommerz and aamarPay/ShurjoPay adapters where merchant credentials and approvals exist.

Courier: manual delivery first, then verified Pathao, Steadfast and RedX adapters. Persist provider request/response references, idempotency keys, tracking events and COD settlement reconciliation.

Local operations: Bangla/English, BDT in paisa, Asia/Dhaka timezone, district/upazila delivery zones, configurable inside/outside city charges, Bangla invoice, VAT/Mushak fields where applicable, COD fraud flags, SMS/email notifications and customer support workflows.

Compliance note: VAT/Mushak calculations and invoice wording require review against current NBR rules by a qualified Bangladesh tax professional before representing them as compliant.

## Build sequence

### Stage 0 — Foundation and source hardening

- Preserve upstream remote and MIT license.
- Rebrand all customer-facing UI and package metadata as The FimiT.
- Run baseline typecheck/build and record results.
- Review tenant RLS, service-role use, public storefront reads, auth recovery and webhook routes.
- Add reproducible self-host deployment documentation and secrets policy.

### Stage 1 — Self-hosted deployment

- Pin an official Supabase Docker release and document upgrade procedure.
- Deploy the app and database stack on a dedicated production VPS, not the development HServer.
- Add persistent volumes, health checks, internal-only database/API ports, TLS reverse proxy and off-host backups.
- Add restore drill and operational runbook.

### Stage 2 — SaaS control plane

- Platform plans, subscriptions, invoices and payment ledger.
- Plan entitlements and quotas: products, orders, media storage, staff and custom domains.
- Merchant onboarding, platform admin, suspension notices, data export and tenant deletion workflow.
- Domain claim, DNS verification, ownership challenge, verified-domain routing and safe removal.

### Stage 3 — Bangladesh commerce integrations

- Payment provider interface with sandbox tests, signed callbacks, server-side verification and idempotency.
- Courier provider interface with credential validation, booking, tracking, cancellation and COD reconciliation.
- Local district/upazila data, delivery rules, SMS provider adapter and Bangla templates.

### Stage 4 — Production trust

- Tenant-isolation tests across every table and public endpoint.
- CSRF/auth/session review, rate limits, webhook signatures, replay protection and audit trails.
- Automated daily database and media backups, off-site copy, restore drill, uptime monitoring and alerts.
- Load test with realistic browsing, product search, cart, checkout and flash-sale traffic.

### Stage 5 — Pilot and launch

- 10 pilot stores; fix operational issues.
- Expand to 25, then 50 stores after capacity review.
- Do not advertise 200 stores or 2,000 concurrent visitors until a repeatable benchmark passes on the actual production hardware.

## Release gates

1. No production credentials in Git or build artifacts.
2. Cross-tenant read/write tests must fail closed.
3. Payment success must only be recorded after provider-side verification; callbacks must be authenticated and idempotent.
4. Courier status changes must require authenticated provider events or verified admin actions.
5. Database and media restore must be demonstrated.
6. Load results must include hardware specs, test profile, p50/p95/p99 latency, error rate, CPU, RAM, DB connections and throughput.
7. Customer-facing plan limits, renewal prices, data ownership and support scope must be published.

## Current infrastructure constraint

The connected HServer is a development/control host with approximately 7.1 GiB RAM, 13 GB free root disk at audit time, and existing workloads. It is not approved as the production host for the full Supabase stack or a 200-store launch. The official Supabase self-hosting guide recommends 8 GB+ RAM and 80 GB+ disk for comfortable deployment. Use HServer for source/build orchestration only; provision a dedicated VPS for production.

## Decision log

- Primary foundation: Scarpar fork.
- Hosting: self-managed infrastructure.
- Initial deployment topology: single modular application plus self-hosted data services; scale vertically first, then separate database/media/workers as measured.
- No 200-store or 2,000-concurrent guarantee without benchmark evidence.
- Keep the original upstream remote and license notice.
## Validation run — 2026-11-26

- `npm run typecheck`: passed.
- `npm run build`: passed with Next.js 15.5.20; static and dynamic route generation completed.
- Official Supabase Compose plus FimiT overlay: `docker compose config --quiet` passed using the current upstream Docker Compose file and placeholder environment values. Production still requires a pinned, reviewed Supabase release.
- Caddy: `caddy validate` passed for the platform host, API host and verified-domain on-demand TLS configuration.
- Migration 0005: applied successfully to a disposable PostgreSQL 17 test database with minimal mocked core tables/functions; verified Starter trial creation, subscription-to-org status synchronization and verified-domain resolution. This is not a substitute for applying all five migrations against the official Supabase stack.
- GitHub Actions workflow is not included in the remote commit because the connected GitHub authorization cannot create workflow files; local typecheck and production-build validation passed. Add CI after the repository connection has workflow-write permission.

The production VPS, real secrets, SMTP, provider credentials, full Supabase integration tests, security review, restore drill and load benchmark remain pending.
