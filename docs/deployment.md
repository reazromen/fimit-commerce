# The FimiT — self-hosted deployment

Production is self-managed. Do not use Vercel or a hosted Supabase project for the production environment.

## 1. Requirements

- Dedicated Ubuntu LTS VPS.
- Docker Engine and Docker Compose v2.24+ (the overlay uses Compose reset tags).
- Recommended starting point: 8 GB+ RAM, 4 CPU cores+, 80 GB+ SSD.
- Public static IP or a reliable network path, DNS control, ports 80/443 reachable.
- A platform hostname and a separate Supabase API hostname.
- Off-host backup destination.

The current HServer is a development/control host with limited free disk and competing workloads. Do not use it as the production tenant host.

## 2. Prepare the source

Clone the FimiT repository to the production VPS. Set a reviewed Supabase release tag or commit; never deploy the upstream moving branch.

```bash
export SUPABASE_REF='<reviewed-release-tag-or-commit>'
export FIMIT_DEPLOY_DIR=/opt/fimit
./deploy/bootstrap-supabase.sh
```

The bootstrap copies the official Supabase Docker configuration into /opt/fimit/supabase and adds the FimiT Compose overlay. It does not generate production secrets or start services.

## 3. Configure Supabase

Follow the official self-hosting guide: https://supabase.com/docs/guides/self-hosting/docker

Inside /opt/fimit/supabase:

1. Configure the official Supabase `.env` using the official key-generation procedure.
2. Set `SUPABASE_PUBLIC_URL=https://api.your-platform-domain`.
3. Set `API_EXTERNAL_URL=https://api.your-platform-domain/auth/v1`.
4. Ensure the official `ANON_KEY` and `SERVICE_ROLE_KEY` are generated for this instance.
5. Configure SMTP for signup confirmation, password reset and invitations.
6. Keep Studio private or disable it in production.
7. Do not expose PostgreSQL, Supavisor or internal services directly to the Internet.

Add these FimiT variables to the same .env file:

- `FIMIT_APP_PATH=/opt/fimit/app` — absolute path to the FimiT repository.
- `FIMIT_APP_URL=https://shop.your-platform-domain`.
- `FIMIT_APP_HOST=shop.your-platform-domain`.
- `SUPABASE_API_HOST=api.your-platform-domain`.
- `ACME_EMAIL=ops@your-platform-domain`.

The official Supabase stack must be configured with a public API URL that Caddy can serve. The FimiT app uses `NEXT_PUBLIC_SUPABASE_URL` for browsers and `SUPABASE_INTERNAL_URL=http://api-gw:8000` for server-side requests on the Docker network.

## 4. Start the stack

From /opt/fimit/supabase:

```bash
docker compose -f docker-compose.yml -f docker-compose.fimit.yml config --quiet
docker compose -f docker-compose.yml -f docker-compose.fimit.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.fimit.yml ps
```

The overlay:
- Builds the FimiT Next.js standalone container.
- Connects it to the private Supabase API gateway.
- Adds Caddy for the platform hostname, API hostname and merchant custom domains.
- Removes public port mappings for the API gateway and Supavisor. Caddy is the public ingress.

## 5. Apply database migrations

Apply the numbered migrations in order against the Supabase Postgres container. Example:

```bash
for file in /opt/fimit/app/supabase/migrations/*.sql; do
  docker exec -i supabase-db psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$file"
done
```

For a new deployment, verify the actual database container name and database name from the pinned official Compose release before running. Never edit an already-applied migration; add a new numbered file.

Create the first platform administrator out-of-band after the user signs up:

```sql
insert into public.platform_admins (user_id)
select id from auth.users where email = 'YOUR_ADMIN_EMAIL'
on conflict (user_id) do nothing;
```

## 6. DNS and custom domains

- Point the platform app hostname to the server.
- Point the Supabase API hostname to the server.
- A merchant adds a TXT record named `_fimit-verification.customer-domain` with the value shown in Storefront → Custom domain.
- After TXT verification, the domain resolver allows Caddy's on-demand TLS authorization.
- The merchant must also point the domain or subdomain to the server using an A/AAAA or CNAME record.
- Caddy obtains certificates only for verified, active tenant domains.

Caddy on-demand TLS must remain protected by the FimiT authorization endpoint. Never remove the `ask` restriction or enable unrestricted certificate issuance. See https://caddyserver.com/docs/automatic-https#on-demand-tls.

## 7. Post-deploy checks

- Confirm all required Supabase containers are healthy.
- Confirm the FimiT app health check passes.
- Test signup, email confirmation, password reset and onboarding.
- Create two test tenants and prove cross-tenant reads/writes are denied.
- Test product/media upload and public storefront rendering.
- Test custom domain TXT verification, DNS routing and TLS issuance.
- Test COD and manual MFS verification.
- Confirm payment webhook signatures and idempotency before enabling a live gateway.
- Confirm courier booking and tracking against provider sandbox/test credentials.
- Verify daily database and media backups and complete a restore drill.
- Run a realistic load test before deciding whether the VPS can support more tenants.

## 8. Security boundaries

- Keep PostgreSQL, Supavisor and Supabase Studio private.
- Keep the service-role key server-only; it bypasses RLS.
- Use unique secrets per environment and keep .env outside Git.
- Restrict Caddy on-demand TLS through the verified-domain ask endpoint.
- Use rate limiting on checkout, auth and webhook endpoints.
- Back up database and media separately, encrypt backups and store them off-host.
- Rotate payment/courier credentials when staff leave or a compromise is suspected.

## 9. Current deployment status

The repository now contains the self-host Compose overlay, standalone Dockerfile, Caddy configuration, private server-side Supabase URL support, domain TXT verification and host routing. This is deployment scaffolding, not a production deployment. A dedicated VPS, real secrets, SMTP, DNS, migration execution, integration credentials, security tests, restore drill and load tests are still required.
