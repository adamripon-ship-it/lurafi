/**
 * Reference component — matches sections/header.liquid
 * Language-only selector (no country/currency). LURAFI wordmark logo.
 */

const CONFIGURE_BUY_URL = 'https://www.lurafi.com/pages/configure?plan=buy'
const LOGO_SRC = '/assets/lurafi-logo.png'

const NAV = [
  { label: 'Why Kevin', href: '#problem' },
  { label: 'Product', href: '#product' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'App', href: '#app' },
  { label: 'Pricing', href: '#pricing' },
]

const LANGUAGES = [
  { value: 'en', label: '🇬🇧 EN' },
  { value: 'nl', label: '🇳🇱 NL' },
  { value: 'fr', label: '🇫🇷 FR' },
  { value: 'de', label: '🇩🇪 DE' },
  { value: 'cs', label: '🇨🇿 CS' },
]

export function SiteHeader() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 bg-transparent pt-[calc(env(safe-area-inset-top,0px)+clamp(10px,2vw,14px))]"
      role="banner"
      data-theme="dark"
    >
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[max-content_minmax(0,1fr)] items-center gap-4 px-[clamp(16px,4vw,24px)] py-2.5 min-[1440px]:grid-cols-[max-content_minmax(0,1fr)_minmax(11.75rem,max-content)] min-[1440px]:gap-[clamp(32px,4vw,72px)]">
        {/* Zone 1: Brand */}
        <a
          href="/"
          className="inline-flex min-h-12 min-w-12 items-center justify-start"
          aria-label="LURAFI home"
        >
          <img
            src={LOGO_SRC}
            alt="LURAFI"
            width={95}
            height={26}
            className="h-[26px] w-[calc(26px*3.645)] max-w-none object-contain object-left brightness-0 invert min-[768px]:h-[34px] min-[768px]:w-[calc(34px*3.645)] min-[1440px]:h-10 min-[1440px]:w-[calc(40px*3.645)]"
          />
        </a>

        {/* Zone 2: Nav (inline @1440px+) */}
        <nav
          className="hidden min-w-0 items-center gap-[clamp(12px,1.6vw,32px)] min-[1440px]:flex"
          aria-label="Main navigation"
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center whitespace-nowrap px-3.5 py-3 text-[0.9375rem] text-[#d2d2d7] transition hover:bg-white/8 hover:text-white min-[1440px]:text-base"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Utilities */}
        <div className="col-start-2 row-start-1 flex items-center justify-end gap-1.5 min-[768px]:gap-2 min-[1440px]:col-start-3 min-[1440px]:gap-[clamp(8px,1vw,14px)]">
          <select
            aria-label="Language"
            className="hidden min-h-9 max-w-[6.75rem] appearance-none rounded-full border-0 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-[#f5f5f7] min-[768px]:block min-[768px]:max-w-none min-[768px]:px-3 min-[768px]:text-xs"
            defaultValue="en"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <a
            href="/login"
            className="hidden min-h-11 items-center text-[13px] font-medium text-[#d2d2d7] opacity-90 hover:opacity-100 hover:underline min-[1440px]:inline-flex"
          >
            Log in
          </a>

          <a
            href={CONFIGURE_BUY_URL}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0071e3] px-4 py-2.5 text-sm text-white hover:bg-[#0077ed] max-[479px]:hidden min-[768px]:hidden min-[1440px]:inline-flex"
          >
            Buy
          </a>

          <button
            type="button"
            aria-label="Cart, 0 items"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#d2d2d7]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <path d="M3.5 5h11l-1.1 8.4a1.5 1.5 0 0 1-1.5 1.3H6.1a1.5 1.5 0 0 1-1.5-1.3L3.5 5z" />
              <path d="M6.5 5V3.75a2.5 2.5 0 0 1 5 0V5" />
            </svg>
          </button>

          <a
            href={CONFIGURE_BUY_URL}
            className="hidden min-h-11 items-center justify-center rounded-full bg-[#0071e3] px-[18px] py-2.5 text-sm text-white hover:bg-[#0077ed] min-[1440px]:inline-flex"
          >
            Buy Now
          </a>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 min-[1440px]:hidden"
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
