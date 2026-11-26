# The FimiT — self-hosting runbook

## Deployment model

The FimiT application is self-hosted. Production must not depend on Vercel or a hosted Supabase project.

Use the official Supabase Docker Compose deployment as the managed-by-us data platform. It supplies PostgreSQL, Auth, PostgREST, Storage and the API gateway. The app connects to the internal API endpoint; only the reverse proxy/API gateway is exposed publicly.

Official reference: https://supabase.com/docs/guides/self-hosting/docker

## Sizing

Supabase currently publishes 4 GB RAM, 2 CPU cores and 40 GB SSD as minimum requirements for all components; 8 GB+ RAM, 4 CPU cores+ and 80 GB+ SSD are recommended. Disable unneeded services only after confirming The FimiT does not depend on them.

Do not deploy the production stack on the connected HServer: it currently has around 7.1 GiB total RAM, 13 GB free root disk, and unrelated workloads. Use a dedicated VPS with at least the recommended resources, then load-test before selecting the final size.

## Network boundaries

- Public: HTTPS reverse proxy for platform app, verified merchant domains and the Supabase API gateway endpoints required by the app.
- Private Docker network: PostgreSQL, Auth, PostgREST, Storage internals, Redis and workers.
- Never publish PostgreSQL port 5432 or internal service ports directly to the Internet.
- Supabase Studio must be private/VPN-protected or disabled in production.
- Use TLS for all public traffic. Keep application-to-database traffic on the private network.

## Secrets

Generate unique secrets per environment. Keep .env files outside the repository and restrict file permissions. Never commit service-role keys, JWT secrets, database passwords, payment credentials, courier credentials or SMTP/SMS keys.

NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are public configuration. SUPABASE_SERVICE_ROLE_KEY is a server-only secret that bypasses RLS and must never enter a browser bundle.

## Persistent data

- PostgreSQL data volume: persistent, backed up daily.
- Supabase Storage/media volume: persistent and backed up separately.
- Redis: persistence only where required by the selected queue/idempotency design.
- Backups: encrypted, off-host, retention policy documented; perform scheduled restore drills.

## Domain model

- Platform admin: a dedicated platform hostname.
- Merchant default hostname: a tenant subdomain under a domain owned by The FimiT.
- Merchant custom domain: merchant adds DNS records; platform issues a verification challenge; only verified ownership can activate host routing.
- Wildcard DNS does not prove ownership of arbitrary custom domains. Verification must be explicit.

## Deployment checklist

1. Provision supported Ubuntu LTS VPS, Docker Engine and Compose plugin.
2. Clone/pin the official Supabase Docker configuration at a tested release tag.
3. Generate secrets and configure public URLs, API URLs, JWT keys, SMTP and storage settings.
4. Apply database migrations in numeric order against a fresh database.
5. Start Supabase and confirm all required services are healthy.
6. Build and run the FimiT app container with production environment variables.
7. Configure reverse proxy and TLS; expose only required endpoints.
8. Create the first platform administrator out-of-band.
9. Verify signup, login, password reset, media upload, store creation, public storefront and tenant isolation.
10. Configure backups, monitoring, log rotation, rate limits and incident alerts.
11. Run a restore drill and baseline load test before onboarding paying merchants.

## Upgrade discipline

- Pin Supabase and app image versions; do not track latest in production.
- Back up database and media before every migration or major upgrade.
- Apply migrations to staging first, run smoke tests, then production.
- Never edit an already-applied migration; add a new numbered migration.
- Record deployed image digest, migration version and rollback instructions.

## Operational limitations

Self-hosting means The FimiT owns patching, database maintenance, backups, high availability, security and disaster recovery. Self-hosted Supabase is not identical to the hosted product; managed backups/PITR, branching, management API and some analytics features are not included.

## Current status

This runbook documents the intended deployment architecture. Production deployment is not complete until a dedicated VPS is provisioned, official Supabase stack is pinned and deployed, secrets are configured, migrations are applied and restore/load tests pass.