import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { env } from '@/lib/env'

// Keep in sync with ORG_COOKIE in src/lib/auth.ts.
const ORG_COOKIE = 'fimit-org'
const RESERVED_STORE_PATHS = new Set([
  'admin', 'api', 'login', 'signup', 'onboarding', 'forgot-password',
  'reset-password', 'invite', 'track', 'pricing', 's', 'health',
])

function isReservedStorePath(pathname: string): boolean {
  const firstSegment = pathname.split('/').filter(Boolean)[0] ?? ''
  return RESERVED_STORE_PATHS.has(firstSegment)
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.SUPABASE_SERVER_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // Refresh the session so server components downstream see a valid cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAdminPath = pathname.startsWith('/admin')
  const isOnboardingPath = pathname.startsWith('/onboarding')

  if ((isAdminPath || isOnboardingPath) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAdminPath && user) {
    const hasOrgCookie = Boolean(request.cookies.get(ORG_COOKIE)?.value)
    if (!hasOrgCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  // Resolve a verified merchant domain to its organization slug. The SQL
  // SECURITY DEFINER function returns only the public slug, never domain
  // verification secrets or tenant records. Unknown hosts are not rewritten.
  const host = request.nextUrl.hostname.toLowerCase().replace(/\.$/, '')
  const platformHost = new URL(env.APP_URL).hostname.toLowerCase().replace(/\.$/, '')
  if (host !== platformHost && !isReservedStorePath(pathname)) {
    const { data: storeSlug, error } = await supabase.rpc('resolve_store_domain', {
      p_hostname: host,
    })

    if (!error && typeof storeSlug === 'string' && storeSlug.length > 0) {
      const url = request.nextUrl.clone()
      url.pathname = `/s/${storeSlug}${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url, { headers: response.headers })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml)$).*)',
  ],
}
