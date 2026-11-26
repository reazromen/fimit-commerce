# HServer preview deployment

Status: running as a development preview on 2026-11-26.

## Access

- Primary URL: https://ops.reazromen.com/fimit
- Access control: existing HServer Caddy ingress and Authelia authentication.
- Internal upstream: `100.91.220.55:13330` (HServer Tailscale IPv4; not directly exposed to the public WAN).
- Next.js `basePath`: `/fimit`; static assets and application routes are emitted beneath this prefix.
- Caddy route: `/home/romen/services/hserver-caddy/Caddyfile`, within the `ops.reazromen.com` host handler (`FIMIT_PREVIEW_V1`).
- Container: `fimit-preview`
- Compose project: `/home/romen/apps/fimit-preview/compose.yml`
- Runtime image: `fimit-preview:fimit-path`
- Restart policy: `unless-stopped`
- Health check: HTTP GET /, 30-second interval.
- Resource guardrails: 1 GiB memory, 1.5 CPU.

## Current limitations

This is an application preview only. It is not yet a functional multi-tenant SaaS deployment.

- Supabase is not running on HServer for this project.
- Public Supabase URL, anon key and service-role key are deliberate placeholders.
- Signup is explicitly blocked with a configuration message until real Supabase credentials are supplied; it must not attempt requests to the placeholder host. Login, database-backed catalogue, checkout, file storage and merchant administration cannot be considered operational.
- The signup password field includes an accessible show/hide control.
- No real merchant or customer data should be entered.
- The full self-hosted Supabase stack was deferred because HServer had approximately 12 GB free disk at deployment time and already hosts many services.
- The public hostname uses the existing Ops ingress and TLS; the application upstream remains Tailscale-bound.

## Update / restart

The deployment is intentionally kept outside the Git working tree so runtime artifacts and generated files do not enter source control.

```bash
cd /home/romen/apps/fimit-preview
docker compose -f compose.yml ps
docker compose -f compose.yml logs --tail 100 fimit-preview
docker compose -f compose.yml restart
```

To update the preview, rebuild the image with `--build-arg NEXT_BASE_PATH=/fimit` and `--build-arg NEXT_PUBLIC_APP_URL=https://ops.reazromen.com/fimit`, then recreate the container. Keep the Caddy route authenticated and preserve the exact `/fimit` handler (do not redirect it to `/fimit/`, because Next.js canonicalizes this app to the no-trailing-slash path). Do not start the bundled Supabase/Caddy overlay on this host without a separate disk and ingress review; the existing HServer Caddy already owns ingress.
