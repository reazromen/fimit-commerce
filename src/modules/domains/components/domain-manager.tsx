'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, Copy, Globe, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { CustomDomain } from '@/types/db'
import { addCustomDomainAction, removeCustomDomainAction, verifyCustomDomainAction } from '@/modules/domains/actions'

export function DomainManager({ domains }: { domains: CustomDomain[] }) {
  const [hostname, setHostname] = useState('')
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function addDomain(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await addCustomDomainAction({ hostname })
      if (!result.ok) { toast.error(result.error); return }
      setHostname('')
      toast.success('Domain added. Configure its DNS TXT record to verify ownership.')
      router.refresh()
    })
  }

  function verify(domainId: string) {
    startTransition(async () => {
      const result = await verifyCustomDomainAction({ domainId })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Domain ownership verified.')
      router.refresh()
    })
  }

  function remove(domainId: string) {
    if (!window.confirm('Remove this domain from your store?')) return
    startTransition(async () => {
      const result = await removeCustomDomainAction({ domainId })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Domain removed.')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connect a domain</CardTitle>
          <CardDescription>Enter a domain you own. Add a DNS TXT verification record before it can serve your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addDomain} className="flex flex-col gap-3 sm:flex-row">
            <Input value={hostname} onChange={(event) => setHostname(event.target.value)} placeholder="shop.example.com" autoComplete="off" />
            <Button type="submit" disabled={pending || !hostname.trim()}><Plus className="mr-2 size-4" /> Add domain</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {domains.length === 0 ? (
          <Card><CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground"><Globe className="size-5" /> No custom domains connected yet.</CardContent></Card>
        ) : domains.map((domain) => (
          <Card key={domain.id}>
            <CardContent className="flex flex-col gap-4 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2"><Globe className="size-4 shrink-0 text-muted-foreground" /><span className="truncate font-medium">{domain.hostname}</span></div>
                <Badge variant={domain.status === 'verified' ? 'default' : 'secondary'}>{domain.status}</Badge>
              </div>
              {domain.status === 'pending' ? (
                <div className="rounded-md border bg-muted/40 p-3 text-sm">
                  <p className="mb-2 font-medium">Verify domain ownership</p>
                  <p className="mb-2 text-muted-foreground">Create this DNS TXT record at your domain provider:</p>
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <div><p className="text-xs text-muted-foreground">Record name</p><code className="break-all text-xs">_fimit-verification.{domain.hostname}</code></div>
                    <div><p className="text-xs text-muted-foreground">TXT value</p><code className="break-all text-xs">{domain.verification_token}</code></div>
                    <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(domain.verification_token)}><Copy className="mr-2 size-3.5" /> Copy token</Button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Also point this hostname to the platform server with an A/AAAA or CNAME record. After DNS propagation, click Verify. HTTPS routing starts only after ownership is verified and DNS reaches the server.</p>
                </div>
              ) : domain.status === 'verified' ? (
                <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="size-4" /> Ownership verified on {domain.verified_at ? new Date(domain.verified_at).toLocaleString() : '—'}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {domain.status === 'pending' ? <Button type="button" size="sm" disabled={pending} onClick={() => verify(domain.id)}><RefreshCw className="mr-2 size-3.5" /> Verify DNS</Button> : null}
                <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => remove(domain.id)}><Trash2 className="mr-2 size-3.5" /> Remove</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {pending ? <p className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" /> Working…</p> : null}
    </div>
  )
}