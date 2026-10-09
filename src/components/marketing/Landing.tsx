import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Card } from '@/components/ui/primitives';
import { steps, features, trust, faqs, testimonials, footerCols } from '@/lib/content';

const cta = 'inline-flex h-11 items-center justify-center rounded-btn px-5 text-sm font-semibold transition';
const wrap = 'mx-auto w-full max-w-[1280px] px-5 sm:px-8';

function SectionHeader({ id, eyebrow, title, sub }: { id: string; eyebrow: string; title: string; sub?: string }) {
  return (
    <div id={id} className="mx-auto max-w-xl scroll-mt-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold sm:text-[28px]">{title}</h2>
      {sub && <p className="mt-3 text-sm text-ink2 sm:text-base">{sub}</p>}
    </div>
  );
}

function Nav() {
  const links = [['How it works', '#how'], ['Features', '#features'], ['FAQ', '#faq']];
  return (
    <header className={`${wrap} flex h-20 items-center justify-between`}>
      <Link href="/" aria-label="TrustPay home"><Logo /></Link>
      <nav aria-label="Main" className="hidden gap-8 text-sm md:flex">{links.map(([l, h]) => <a key={h} href={h} className="text-ink2 hover:text-white">{l}</a>)}</nav>
      <div className="flex items-center gap-3">
        <Link href="/login" className="hidden text-sm text-ink2 hover:text-white sm:block">Log in</Link>
        <Link href="/register" className={`${cta} bg-primary text-white hover:brightness-110`}>Get Started</Link>
        <details className="relative md:hidden">
          <summary aria-label="Menu" className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full bg-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </summary>
          <div className="absolute right-0 top-14 z-20 w-56 rounded-card bg-s1 p-3 shadow-xl">
            {links.map(([l, h]) => <a key={h} href={h} className="flex h-12 items-center rounded-btn px-3 text-ink2 hover:bg-s3 hover:text-white">{l}</a>)}
          </div>
        </details>
      </div>
    </header>
  );
}

export function Landing() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[640px]" style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(85,66,246,.45), transparent 70%)' }} />
      <div className="relative">
        <Nav />
        <section className={`${wrap} pb-20 pt-12 text-center sm:pt-20`}>
          <span className="inline-block rounded-full border border-primary/60 px-4 py-1.5 text-xs font-semibold text-soft">Milestone-based payment protection</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-[32px] font-semibold leading-tight sm:text-5xl">Get paid for the work. Pay for the work <span className="text-soft">you receive.</span></h1>
          <p className="mx-auto mt-5 max-w-xl text-ink2 sm:text-lg">TrustPay protects African freelancers and their clients by funding and releasing payment one milestone at a time.</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="/register" className={`${cta} bg-white text-page hover:bg-white/90`}>Get Started</Link>
            <a href="#how" className={`${cta} border border-line hover:bg-s2b`}>See how it works</a>
          </div>
        </section>

        <section className={`${wrap} pb-20`}><p className="text-center text-sm text-ink2">Powered by Kora</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map(([t, d]) => <li key={t}><Card className="h-full p-5"><h3 className="font-semibold">{t}</h3><p className="mt-2 text-sm text-ink2">{d}</p></Card></li>)}
          </ul></section>

        <section className={`${wrap} py-16`}><SectionHeader id="how" eyebrow="How it works" title="Three steps from brief to payment" sub="Simple for clients, safe for freelancers." />
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map(s => <li key={s.n}><Card className="h-full p-6 sm:p-8"><p className="text-3xl font-semibold text-soft">{s.n}</p><h3 className="mt-4 text-xl font-semibold">{s.title}</h3><p className="mt-3 text-sm text-ink2">{s.body}</p></Card></li>)}
          </ol></section>

        <section className={`${wrap} py-16`}><SectionHeader id="features" eyebrow="Features" title="Everything a milestone needs" />
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {features.map(f => <li key={f.title}><Card className="h-full p-6 sm:p-8"><h3 className="text-xl font-semibold">{f.title}</h3><p className="mt-3 text-sm text-ink2">{f.body}</p></Card></li>)}
          </ul></section>

        <section className={`${wrap} py-16`}><SectionHeader id="faq" eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {faqs.map(f => (
              <details key={f.q} className="group rounded-card bg-s1 p-5 sm:p-6">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-semibold">{f.q}<span aria-hidden className="text-xl text-ink2 group-open:rotate-45">+</span></summary>
                <p className="mt-3 text-sm text-ink2">{f.a}</p>
              </details>))}
          </div></section>

        <section className={`${wrap} py-16`}><SectionHeader id="testimonials" eyebrow="Testimonials" title="What early users say" />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map(t => <li key={t.name}><Card className="flex h-full flex-col p-6"><p className="text-sm text-ink2">“{t.quote}”</p>
              <p className="mt-auto pt-6 font-semibold">{t.name}<span className="block text-xs font-normal text-ink2">{t.role}</span></p></Card></li>)}
          </ul></section>

        <footer className={`${wrap} border-t border-line/40 py-12`}>
          <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
            <div><Logo /><p className="mt-4 max-w-xs text-sm text-ink2">Milestone-based payment protection for African freelancers and clients.</p></div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {footerCols.map(([h, items]) => <div key={h}><h3 className="text-xs font-semibold uppercase tracking-wide">{h}</h3>
                <ul className="mt-4 space-y-3 text-sm text-ink2">{items.map(i => <li key={i}>{i}</li>)}</ul></div>)}
            </div>
          </div>
          <p className="mt-10 text-xs text-ink2">© 2026 TrustPay. TrustPay is a milestone-based payment protection and release platform and is not presented as a regulated escrow service.</p>
        </footer>
      </div>
    </div>
  );
}
