import { NextRequest } from 'next/server'
import { getAnonClient } from '@/lib/supabase/anon'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Caddy On-Demand TLS authorization. Only verified, active merchant domains
// receive a 2xx response; the resolver exposes no tenant data or token.
export async function GET(request: NextRequest) {
  const hostname = request.nextUrl.searchParams.get('domain')?.trim().toLowerCase().replace(/\.$/, '')
  if (!hostname || hostname.length > 253) return new Response(null, { status: 400 })

  const valid = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)
  if (!valid) return new Response(null, { status: 400 })

  const supabase = getAnonClient()
  const { data, error } = await supabase.rpc('resolve_store_domain', { p_hostname: hostname })
  return !error && typeof data === 'string' && data.length > 0
    ? new Response(null, { status: 204 })
    : new Response(null, { status: 403 })
}
