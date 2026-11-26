# The FimiT Commerce — delivery roadmap

Status date: 2026-11-26. This document describes the actual FimiT fork, not the upstream product specification.

## Phase 0 — Repository and product foundation

**Completed in development**

- Forked the MIT-licensed Scarpar repository to reazromen/fimit-commerce; retained the upstream remote and original license notice.
- Rebranded application metadata, admin UI, SVG assets and package identity as The FimiT.
- Added the public ৳1 development-offer landing page with clear separation of domain, hosting and third-party fees.
- Added Docker standalone build, self-hosted Supabase Compose overlay, Caddy reverse proxy and private server-side Supabase URL support.
- Added GitHub Actions CI for typecheck and production build.

## Phase 1 — SaaS control plane

**Partially implemented**

### Implemented
- platform_plans: BDT paisa pricing, trial days, module allowlists and JSON plan limits.
- platform_subscriptions: one subscription per org, status lifecycle, provider references and trial dates.
- platform_invoices: merchant-visible invoice records with server-controlled payment status.
- platform_payment_events: provider callback idempotency ledger.
- New tenants receive a 14-day Starter trial; existing tenants are grandfathered active.
- Subscription changes synchronize cached billing fields on orgs.
- Merchant custom-domain page, DNS TXT ownership verification and domain removal.
- Public-safe resolve_store_domain() SQL function.
- Middleware rewrites verified domains to the corresponding store route.
- Caddy on-demand TLS is restricted through the domain authorization endpoint.

### Still required
- Platform-admin plan editor and merchant billing page.
- Manual bKash/Nagad subscription invoice collection and reconciliation.
- Provider-backed recurring/renewal payment flow where supported.
- Plan entitlement enforcement for products, orders, storage, staff and modules.
- Trial expiry, grace-period transitions, suspension and renewal automation.
- Public pricing page only after commercial prices and plan limits are approved.
- Default tenant subdomains, DNS health checks, certificate lifecycle UX and production tests.
- Merchant data export, deletion and retention policy.

## Phase 2 — Bangladesh payment integrations

**Partially implemented**

### Existing foundation
- Cash on Delivery.
- Manual MFS payment instructions and transaction-reference verification.
- Existing order payment verification chokepoint and audit trail.
- UddoktaPay webhook route exists but is not a complete provider-confirmation flow.

### Required
- bKash Checkout / tokenized payment with server-side execute/query validation.
- Nagad merchant gateway integration.
- SSLCommerz hosted checkout and IPN validation.
- Optional aamarPay and ShurjoPay adapters.
- Shared provider interface, credential validation, signed callbacks, idempotency, refunds and reconciliation.
- Merchant-specific gateway credentials, encrypted at rest and never shared across tenants.
- Sandbox integration tests before production credentials are enabled.

## Phase 3 — Bangladesh courier and operations

**Partially implemented**

### Existing foundation
- Delivery zones and configurable delivery charges.
- Order/delivery records and tracking page.
- Courier adapter seams and webhook route.

### Required
- Verified Pathao, Steadfast and RedX create-order, cancel, tracking and COD-settlement flows.
- Additional providers only when their API contracts and credentials are available.
- District/upazila dataset and merchant-editable delivery zones.
- COD confirmation and fraud-risk workflow.
- SMS and email provider adapters using a Bangladesh SMS provider and a reliable email service.
- Bangla/English notification templates, invoices and customer support workflows.
- VAT/Mushak behavior reviewed by a Bangladesh tax professional before compliance claims.

## Phase 4 — Security, reliability and platform operations

**Not production-ready**

- Review every RLS policy and test cross-tenant reads/writes.
- Verify all service-role access is server-only and narrow.
- Complete password reset, signup abuse controls, email confirmation and MFA for owners.
- Authenticate payment/courier webhooks; add replay protection and idempotency.
- Add per-tenant rate limits for auth, checkout, search and webhook surfaces.
- Add structured logs, Sentry/error reporting, uptime checks and alerts.
- Automate encrypted database and media backups; complete off-host restore drills.
- Build platform usage metrics, plan assignment, suspension, audit and data export/delete tools.
- Publish privacy, retention, renewal, refund and support terms.

## Phase 5 — Capacity and scale

**Benchmark-gated**

- Start with 10 pilot stores.
- Expand to 25 and 50 only after resource and support review.
- Test 200 tenant domains and 2,000 virtual users with realistic browsing, search, cart, checkout and flash-sale profiles.
- Record p50/p95/p99 latency, throughput, errors, CPU, RAM, DB connections, I/O and network.
- Scale database, object storage and workers separately only when measurements justify it.
- Do not promise 200 stores or 2,000 concurrent visitors based on RAM estimates alone.

## Commercial rules

- The ৳1 development fee is an acquisition offer, not unlimited free development.
- Domain registration, hosting, payment gateway fees, courier fees, SMS and optional customization/support are separate.
- Customer owns their domain and gateway accounts.
- Publish package limits, renewal rates, support scope, backup/restore policy and data export terms before collecting payments.
- The draft Starter/Business/Growth prices in migration 0005 are internal defaults and must not be advertised until approved.

## Release gates

1. Typecheck and production build pass in CI.
2. All migrations apply cleanly to the pinned self-hosted Supabase release.
3. Cross-tenant isolation tests pass for database, storage, APIs and custom domains.
4. Payment and courier callbacks are verified and idempotent.
5. Backup and restore are demonstrated.
6. Security review and incident runbook are complete.
7. Load test passes on the actual production VPS.
8. Merchant terms, plan prices and operational support are approved.
