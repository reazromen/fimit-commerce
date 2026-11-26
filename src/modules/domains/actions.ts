'use server'

import { resolveTxt } from 'node:dns/promises'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { audit } from '@/lib/audit'
import { env } from '@/lib/env'
import { requireOrg, requireRole } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types'
import type { CustomDomain } from '@/types/db'

const hostnameSchema = z.string().trim().min(4).max(253)
  .transform((value) => value.toLowerCase().replace(/\.$/, ''))
  .refine((value) => /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(value),
    'Enter a valid domain without https:// or a path.')

function refreshDomainPages() {
  revalidatePath('/admin/storefront')
  revalidatePath('/admin/storefront/domain')
}

export async function addCustomDomainAction(input: { hostname: string }): Promise<ActionResult<CustomDomain>> {
  const ctx = await requireOrg()
  requireRole(ctx, 'admin')
  const parsed = hostnameSchema.safeParse(input.hostname)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid domain' }

  const hostname = parsed.data
  const platformHost = new URL(env.APP_URL).hostname.toLowerCase()
  if (hostname === platformHost || hostname.endsWith(`.${platformHost}`)) {
    return { ok: false, error: 'Use a domain you control, not the platform domain.' }
  }

  const supabase = await getServerClient()
  const [{ count }, { data: plan }] = await Promise.all([
    supabase.from('custom_domains').select('id', { count: 'exact', head: true }).eq('org_id', ctx.org.id),
    supabase.from('platform_plans').select('limits').eq('plan_key', ctx.org.plan_key ?? 'starter').single(),
  ])
  const limits = (plan?.limits ?? {}) as Record<string, unknown>
  const maxDomains = typeof limits.max_custom_domains === 'number' ? limits.max_custom_domains : 1
  if ((count ?? 0) >= maxDomains) {
    return { ok: false, error: `Your plan allows ${maxDomains} custom domain(s). Upgrade to add more.` }
  }

  const { data, error } = await supabase.from('custom_domains').insert({ org_id: ctx.org.id, hostname }).select('*').single()
  if (error || !data) {
    return { ok: false, error: error?.code === '23505' ? 'This domain is already connected to a store.' : error?.message ?? 'Could not add domain.' }
  }
  const domain = data as CustomDomain
  audit(ctx, 'storefront.domain_added', 'custom_domains', domain.id, null, { hostname, status: domain.status })
  refreshDomainPages()
  return { ok: true, data: domain }
}

export async function verifyCustomDomainAction(input: { domainId: string }): Promise<ActionResult> {
  const ctx = await requireOrg()
  requireRole(ctx, 'admin')
  const id = z.string().uuid().safeParse(input.domainId)
  if (!id.success) return { ok: false, error: 'Invalid domain reference.' }

  const supabase = await getServerClient()
  const { data, error } = await supabase.from('custom_domains').select('*')
    .eq('id', id.data).eq('org_id', ctx.org.id).single()
  if (error || !data) return { ok: false, error: 'Domain not found.' }
  const domain = data as CustomDomain
  if (domain.status === 'verified') return { ok: true }

  const recordName = `_fimit-verification.${domain.hostname}`
  try {
    const records = await resolveTxt(recordName)
    const values = records.map((parts) => parts.join(''))
    if (!values.includes(domain.verification_token)) {
      return { ok: false, error: `TXT record exists at ${recordName}, but its value does not match.` }
    }
  } catch {
    return { ok: false, error: `TXT record not found. Add it at ${recordName} and retry after DNS propagation.` }
  }

  const verifiedAt = new Date().toISOString()
  const { error: updateError } = await supabase.from('custom_domains').update({
    status: 'verified', verification_token: '', verified_at: verifiedAt,
    verified_by: ctx.user.id, updated_at: verifiedAt,
  }).eq('id', domain.id).eq('org_id', ctx.org.id)
  if (updateError) return { ok: false, error: updateError.message }

  audit(ctx, 'storefront.domain_verified', 'custom_domains', domain.id,
    { status: domain.status }, { status: 'verified', hostname: domain.hostname })
  refreshDomainPages()
  return { ok: true }
}

export async function removeCustomDomainAction(input: { domainId: string }): Promise<ActionResult> {
  const ctx = await requireOrg()
  requireRole(ctx, 'admin')
  const id = z.string().uuid().safeParse(input.domainId)
  if (!id.success) return { ok: false, error: 'Invalid domain reference.' }

  const supabase = await getServerClient()
  const { data: domain } = await supabase.from('custom_domains').select('id, hostname, status')
    .eq('id', id.data).eq('org_id', ctx.org.id).single()
  if (!domain) return { ok: false, error: 'Domain not found.' }

  const { error } = await supabase.from('custom_domains').delete().eq('id', id.data).eq('org_id', ctx.org.id)
  if (error) return { ok: false, error: error.message }
  audit(ctx, 'storefront.domain_removed', 'custom_domains', id.data, domain, null)
  refreshDomainPages()
  return { ok: true }
}