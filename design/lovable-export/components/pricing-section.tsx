/**
 * Reference component — matches sections/lp-pricing.liquid
 */

const BUY_FEATURES = [
  'Full device ownership',
  '70+ hours of built-in simulations',
  'Weekly schedules and geo-aware activation',
  'Upload your own household sounds',
  'Flexible placement with 3 m power cable',
  'Free delivery',
  '3-year warranty',
]

const SUB_FEATURES = [
  'Device included free',
  'Premium simulation library',
  'Regular software updates',
  'Priority support',
  'Hardware replacement support',
  'Flexible for multiple rooms or properties',
  'Free delivery',
]

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-[clamp(52px,8vw,92px)]">
      <div className="mx-auto max-w-[980px] px-4 md:px-6">
        <p className="mb-3 text-center text-[17px] text-[#0071e3]">Pricing</p>
        <h2 className="mb-4 text-center text-[clamp(28px,5vw,48px)] font-semibold leading-tight text-[#1d1d1f]">
          Choose your security layer.
        </h2>
        <p className="mx-auto mb-14 max-w-[580px] text-center text-[clamp(19px,2.5vw,28px)] text-[#6e6e73]">
          Own Kevin outright or subscribe monthly. Either way, you get a
          privacy-first presence simulator built to deter before an alarm is
          needed.
        </p>

        <div className="mx-auto grid max-w-[760px] gap-3 md:grid-cols-2">
          <div className="flex h-full flex-col rounded-[20px] bg-[#f5f5f7] p-8 md:p-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#0071e3]">
              One-time purchase
            </p>
            <h3 className="text-[28px] font-semibold text-[#1d1d1f]">Kevin</h3>
            <p className="mb-2 text-[#6e6e73]">Own it forever.</p>
            <p className="mb-6 text-[32px] font-semibold text-[#1d1d1f]">
              CHF 609.00
            </p>
            <ul className="mb-8 flex-1 space-y-2 text-[#1d1d1f]">
              {BUY_FEATURES.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <a
              href="#"
              className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#0071e3] text-[17px] text-white hover:bg-[#0077ed]"
            >
              Buy Now
            </a>
          </div>

          <div className="flex h-full flex-col rounded-[20px] bg-[#1d1d1f] p-8 md:p-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#2997ff]">
              Monthly subscription
            </p>
            <h3 className="text-[28px] font-semibold text-white">Kevin+</h3>
            <p className="mb-2 text-[#a1a1a6]">Device included. Cancel anytime.</p>
            <p className="mb-6 text-[32px] font-semibold text-white">CHF 13.00</p>
            <ul className="mb-8 flex-1 space-y-2 text-[#f5f5f7]">
              {SUB_FEATURES.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <a
              href="#"
              className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#2997ff] text-[17px] text-white hover:opacity-90"
            >
              Subscribe Now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
