#!/usr/bin/env bash
set -euo pipefail

# Set SUPABASE_REF to a reviewed upstream release tag or commit before running.
: "${SUPABASE_REF:?Set SUPABASE_REF to a pinned, reviewed Supabase release tag or commit}"
FIMIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${FIMIT_DEPLOY_DIR:-/opt/fimit}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$DEST/supabase"
git clone --depth 1 --branch "$SUPABASE_REF" https://github.com/supabase/supabase.git "$TMP/supabase"
cp -a "$TMP/supabase/docker/." "$DEST/supabase/"
cp "$FIMIT_ROOT/deploy/supabase/docker-compose.fimit.yml" "$DEST/supabase/docker-compose.fimit.yml"
cp "$FIMIT_ROOT/deploy/Caddyfile" "$DEST/supabase/Caddyfile"
printf 'Official Supabase Docker config copied to %s/supabase\n' "$DEST"
printf 'Next: configure the official .env, add FIMIT_APP_PATH/FIMIT_APP_URL/FIMIT_APP_HOST/SUPABASE_API_HOST/ACME_EMAIL, then review docker-compose.fimit.yml before starting services.\n'
