import { requireOrg, requireRole } from '@/lib/auth'
import { requireModule } from '@/lib/modules'
import { getServerClient } from '@/lib/supabase/server'
import type { CustomDomain } from '@/types/db'
import { PageHeader } from '@/components/ui/page-header'
import { DomainManager } from '@/modules/domains/components/domain-manager'

export const dynamic = 'force-dynamic'

export default async function StorefrontDomainPage() {
  const ctx = await requireOrg()
  requireModule(ctx.org, 'storefront')
  requireRole(ctx, 'admin')

  const supabase = await getServerClient()
  const { data } = await supabase.from('custom_domains').select('*')
    .eq('org_id', ctx.org.id).order('created_at', { ascending: false })

  return (
    <>
      <PageHeader title="Custom domain" description="Connect a domain you own to your FimiT storefront." />
      <DomainManager domains={(data ?? []) as CustomDomain[]} />
    </>
  )
}