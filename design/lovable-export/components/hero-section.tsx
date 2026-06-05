/**
 * Reference component — paste into Lovable. Matches sections/hero.liquid + lurafi.css
 */

const HERO_DEVICE =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663143838195/XAqmtb4V6fmS5cL6eq54xv/lurafi-device-angle-transparent-feBmUBJ5mWe9dTyXfTHnUU.webp'

const CALLOUTS = [
  {
    id: 'away',
    eyebrow: 'Away mode',
    title: 'Living room active',
    body: 'Light, shadow, and sound vary automatically.',
    className: 'left-0 top-[8%] md:left-[-28px] md:top-[12%]',
  },
  {
    id: 'privacy',
    eyebrow: 'Privacy',
    title: 'No cameras. No mics.',
    body: 'Simulation plays locally on the device.',
    className: 'right-0 top-[40%] md:right-[-36px] md:top-[38%]',
  },
  {
    id: 'checkout',
    eyebrow: 'Checkout',
    title: 'Free delivery',
    body: 'Secure Shopify checkout.',
    className: 'hidden md:block left-[8%] bottom-[7%]',
  },
]

export function HeroSection() {
  return (
    <section
      className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-black pt-[var(--header-offset,88px)] text-center"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 70%, rgba(255,255,255,0.04) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col items-center px-4 md:px-6">
        <div className="max-w-[980px] pt-12 md:pt-24">
          <p className="mb-3 text-[17px] tracking-tight text-[#64b5ff]">
            Swiss presence simulation
          </p>
          <h1
            id="hero-heading"
            className="mb-4 text-[clamp(40px,7vw,80px)] font-semibold leading-[1.05] tracking-tight text-white"
          >
            Make Home Look Alive.
          </h1>
          <p className="mx-auto mb-8 max-w-[600px] px-4 text-[clamp(19px,2.5vw,28px)] leading-snug text-[#d2d2d7]">
            Kevin uses Swiss-engineered light, shadow, and everyday sound to make
            your home feel occupied before anyone tests the door.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a
              href="#pricing"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#2997ff] px-7 py-3 text-[17px] text-white transition hover:opacity-90 active:scale-[0.98]"
            >
              Buy Kevin
            </a>
            <a
              href="#how-it-works"
              className="inline-flex min-h-[44px] items-center gap-1 text-[17px] text-[#2997ff] hover:underline"
            >
              How it works
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden>
                <path
                  d="M1 1L6 6L1 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-10 flex max-w-[580px] flex-1 items-center justify-center px-4">
          <img
            src={HERO_DEVICE}
            alt="Kevin presence simulation device"
            className="max-h-[min(42vh,420px)] w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)] md:max-h-[45vh]"
            loading="eager"
          />
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {CALLOUTS.map((card) => (
              <div
                key={card.id}
                className={`absolute w-[min(190px,42vw)] rounded-[18px] border border-white/15 bg-[rgba(29,29,31,0.72)] p-3 text-left backdrop-blur-xl md:w-[190px] md:p-4 ${card.className}`}
              >
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#2997ff]">
                  {card.eyebrow}
                </span>
                <strong className="mb-1 block text-[15px] leading-tight text-[#f5f5f7]">
                  {card.title}
                </strong>
                <span className="block text-xs leading-snug text-[#d2d2d7]">
                  {card.body}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
