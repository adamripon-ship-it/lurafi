/**
 * Reference component — matches sections/lp-app.liquid
 */

const PHONE_1 =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663143838195/XAqmtb4V6fmS5cL6eq54xv/lurafi-app-iphone-mockup-8uNpRd5swi832cYXserPzn.webp'
const PHONE_2 =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663143838195/XAqmtb4V6fmS5cL6eq54xv/lurafi-app-schedule-mockup-kyUXBFJHfo5Kk8TJi6rwbt.webp'

const TILES = [
  {
    title: 'Weekly schedules',
    body: 'Plan mornings, evenings, nights, weekends, and holidays so your home follows a believable rhythm while you are away.',
  },
  {
    title: 'Geo-aware activation',
    body: 'Kevin can start when you leave the area, while still letting you trigger a simulation manually for quick errands.',
  },
  {
    title: 'Your own sounds',
    body: 'Upload recordings and tag them by room or activity so the simulation can sound more like your household.',
  },
  {
    title: 'Multiple places',
    body: 'Use more than one Kevin for apartments, extra floors, offices, or second homes that should not feel abandoned.',
  },
]

export function AppSection() {
  return (
    <section id="app" className="bg-black py-[clamp(52px,8vw,92px)] text-white">
      <div className="mx-auto max-w-[980px] px-4 md:px-6">
        <header className="mb-12 text-center">
          <p className="mb-3 text-[17px] text-[#2997ff]">Kevin App</p>
          <h2 className="mb-4 text-[clamp(28px,5vw,48px)] font-semibold leading-tight">
            Presence on your schedule.
          </h2>
          <p className="mx-auto max-w-[640px] text-[clamp(19px,2.5vw,28px)] text-[#a1a1a6]">
            Turn Kevin on, plan weekly routines, and manage multiple devices from
            one simple app built for peace of mind.
          </p>
        </header>

        <div
          className="mb-16 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 md:justify-center md:overflow-visible"
          role="region"
          aria-roledescription="carousel"
          aria-label="App screenshots"
        >
          {[
            { src: PHONE_1, caption: 'Protected — arm and disarm from anywhere' },
            { src: PHONE_2, caption: 'Schedule — set protection by day and hour' },
          ].map((phone) => (
            <figure
              key={phone.src}
              className="min-w-[78vw] shrink-0 snap-center md:min-w-0 md:w-[28vw] md:max-w-[320px]"
            >
              <img
                src={phone.src}
                alt={phone.caption}
                className="mx-auto w-full max-w-[320px]"
                loading="lazy"
              />
              <figcaption className="mt-3 text-center text-sm text-[#a1a1a6]">
                {phone.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {TILES.map((tile) => (
            <div
              key={tile.title}
              className="rounded-[20px] border border-white/10 bg-[#1d1d1f] p-8"
            >
              <h3 className="mb-2 text-lg font-semibold">{tile.title}</h3>
              <p className="text-[#a1a1a6]">{tile.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
