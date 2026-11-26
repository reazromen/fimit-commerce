# HServer preview deployment

Status: running as a development preview on 2026-11-26.

## Access

- URL: http://100.91.220.55:13330/
- Network scope: bound to the HServer Tailscale IPv4 address; this is not exposed through the public WAN or existing Caddy ingress.
- Container: `fimit-preview`
- Compose project: `/home/romen/apps/fimit-preview/compose.yml`
- Runtime image: `fimit-preview:f344bf1`
- Restart policy: `unless-stopped`
- Health check: HTTP GET /, 30-second interval.
- Resource guardrails: 1 GiB memory, 1.5 CPU.

## Current limitations

This is an application preview only. It is not yet a functional multi-tenant SaaS deployment.

- Supabase is not running on HServer for this project.
- Public Supabase URL, anon key and service-role key are deliberate placeholders.
- Signup, login, database-backed catalogue, checkout, file storage and merchant administration cannot be considered operational.
- No real merchant or customer data should be entered.
- The full self-hosted Supabase stack was deferred because HServer had approximately 12 GB free disk at deployment time and already hosts many services.
- The preview is bound to Tailscale only. It has no public DNS name or public TLS certificate.

## Update / restart

The deployment is intentionally kept outside the Git working tree so runtime artifacts and generated files do not enter source control.

```bash
cd /home/romen/apps/fimit-preview
docker compose -f compose.yml ps
docker compose -f compose.yml logs --tail 100 fimit-preview
docker compose -f compose.yml restart
```

To update the preview, rebuild the standalone Next.js output in the source checkout, copy the new `.next/standalone`, `.next/static` and `public` artifacts into this deployment directory, rebuild the image, then recreate the container. Do not start the bundled Supabase/Caddy overlay on this host without a separate disk and ingress review; the existing HServer Caddy already owns ingress.
