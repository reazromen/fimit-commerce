import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  CreditCard,
  Globe2,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'The FimiT — Your online shop, built for Bangladesh',
  description: 'Launch a mobile-friendly e-commerce website for ৳1 development fee. Domain and hosting are separate.',
}

const features = [
  { icon: ShoppingBag, title: 'Your own online shop', text: 'A branded, mobile-friendly storefront with product pages, categories, cart and checkout.' },
  { icon: Package, title: 'Products and stock', text: 'Manage products, variants, inventory and customer orders from one admin panel.' },
  { icon: CreditCard, title: 'Bangladesh checkout', text: 'Start with Cash on Delivery and manual bKash/Nagad payment verification. Gateway availability depends on merchant approval.' },
  { icon: Truck, title: 'Local delivery rules', text: 'Set delivery zones and charges for the areas where you serve customers.' },
  { icon: BarChart3, title: 'Business overview', text: 'Track orders, sales, customers and day-to-day store operations.' },
  { icon: ShieldCheck, title: 'Store data separation', text: 'Each business gets its own account, products, orders and private administration.' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight">The FimiT<span className="text-primary">.</span></Link>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline-flex">Log in</Link>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Create your store <ArrowRight className="size-4" /></Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-28 lg:pt-20">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            <Globe2 className="size-3.5" /> Built for Bangladeshi businesses
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your business deserves its own <span className="text-primary">online shop.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Launch a professional e-commerce website without paying a large development fee. Manage products, orders and customers from one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Start for ৳1 <ArrowRight className="size-4" /></Link>
            <Link href="#how-it-works" className="rounded-md border px-5 py-3 text-sm font-semibold hover:bg-muted">How it works</Link>
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">৳1 is the website development fee. Domain registration, hosting and third-party service charges are separate.</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div><p className="text-sm font-semibold">Your Store Dashboard</p><p className="text-xs text-muted-foreground">A simpler way to run your shop</p></div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">Store active</span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5">
              <div className="rounded-xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">Orders</p><p className="mt-2 text-2xl font-bold">Manage</p><p className="mt-1 text-xs text-muted-foreground">New and completed</p></div>
              <div className="rounded-xl bg-muted/60 p-4"><p className="text-xs text-muted-foreground">Products</p><p className="mt-2 text-2xl font-bold">Organise</p><p className="mt-1 text-xs text-muted-foreground">Stock and variants</p></div>
              <div className="col-span-2 rounded-xl border p-4">
                <div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold">Store essentials</p><Boxes className="size-4 text-primary" /></div>
                {['Product catalogue', 'Customer orders', 'Delivery settings', 'Sales reports'].map((item) => <div key={item} className="flex items-center gap-2 border-t py-2.5 text-sm"><CheckCircle2 className="size-4 text-emerald-600" /> {item}</div>)}
              </div>
            </div>
            <div className="border-t bg-muted/30 px-5 py-3 text-xs text-muted-foreground">Illustrative dashboard preview — actual data appears after your store is set up.</div>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/25">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-8 md:grid-cols-3">
          <div><p className="text-2xl font-bold">৳1</p><p className="mt-1 text-sm text-muted-foreground">Website development fee</p></div>
          <div><p className="text-2xl font-bold">Bangla-ready</p><p className="mt-1 text-sm text-muted-foreground">Designed around local business workflows</p></div>
          <div><p className="text-2xl font-bold">Your domain</p><p className="mt-1 text-sm text-muted-foreground">Your brand and your customer relationships</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-widest text-primary">Everything in one place</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Tools to run your online business.</h2><p className="mt-4 text-muted-foreground">Start with the essentials. Keep your products, orders and day-to-day operations organised as your business grows.</p></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-xl border bg-card p-5"><div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}
        </div>
      </section>

      <section id="how-it-works" className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-widest text-primary">Getting started</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From business idea to online store.</h2></div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[['01', 'Create your account', 'Tell us your business name and choose your store identity.'], ['02', 'Add your products', 'Upload product details, images, prices and stock.'], ['03', 'Connect your domain', 'Use a domain you own, configure hosting and publish your shop.']].map(([number, title, text]) => <div key={number} className="border-t-2 border-primary pt-5"><p className="text-sm font-bold text-primary">{number}</p><h3 className="mt-3 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start building your online presence.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">A clear, low-cost way to launch your own store while keeping your brand and customer relationships under your control.</p>
        <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Create your store for ৳1 <ArrowRight className="size-4" /></Link>
        <p className="mt-4 text-xs text-muted-foreground">Domain, hosting, gateway and courier fees are separate. Feature scope and eligibility apply.</p>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} The FimiT. Built for Bangladesh.</p>
          <div className="flex gap-4"><Link href="/login" className="hover:text-foreground">Log in</Link><Link href="/signup" className="hover:text-foreground">Create account</Link></div>
        </div>
      </footer>
    </main>
  )
}
