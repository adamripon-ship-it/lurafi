/**
 * Reference component — matches sections/header.liquid
 */

const NAV = [
  { label: 'Why Kevin', href: '#problem' },
  { label: 'Product', href: '#product' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'App', href: '#app' },
  { label: 'Pricing', href: '#pricing' },
]

export function SiteHeader() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 bg-transparent"
      role="banner"
      data-theme="dark"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 md:px-6 lg:grid-cols-[auto_auto_auto_1fr_auto] lg:gap-0 lg:px-7">
        <a
          href="/"
          className="truncate text-[clamp(1.1875rem,4.5vw,1.3125rem)] font-semibold text-white lg:max-w-[12rem]"
        >
          Mitipi GmbH
        </a>

        <div className="hidden h-px w-full bg-white/20 lg:block" aria-hidden />

        <nav
          className="hidden items-center gap-5 lg:flex"
          aria-label="Main navigation"
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="min-h-[44px] px-2 py-2 text-[0.9375rem] text-[#d2d2d7] transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="col-start-3 flex items-center gap-2 lg:col-start-5 lg:gap-3">
          <select
            aria-label="Country / region"
            className="hidden min-h-[36px] max-w-full appearance-none rounded-full border-0 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#f5f5f7] sm:block"
            defaultValue="CH"
          >
            <option value="CH">Switzerland (CHF)</option>
            <option value="DE">Germany (EUR)</option>
          </select>
          <select
            aria-label="Language"
            className="min-h-[36px] appearance-none rounded-full border-0 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#f5f5f7]"
            defaultValue="en"
          >
            <option value="en">EN</option>
            <option value="nl">NL</option>
          </select>
          <a
            href="/login"
            className="hidden min-h-[44px] items-center text-sm text-[#d2d2d7] hover:text-white md:inline-flex"
          >
            Log in
          </a>
          <button
            type="button"
            aria-label="Cart, 0 items"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[#d2d2d7]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <path d="M3.5 5h11l-1.1 8.4a1.5 1.5 0 0 1-1.5 1.3H6.1a1.5 1.5 0 0 1-1.5-1.3L3.5 5z" />
              <path d="M6.5 5V3.75a2.5 2.5 0 0 1 5 0V5" />
            </svg>
          </button>
          <a
            href="#pricing"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#0071e3] px-[18px] py-2.5 text-sm text-white hover:bg-[#0077ed]"
          >
            Buy Now
          </a>
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 lg:hidden"
            aria-label="Open menu"
          >
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
          </button>
        </div>
      </div>
    </header>
  )
}
