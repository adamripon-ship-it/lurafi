# mitipi.eu — Page-by-page rewrite (Phase 2, Step 3)

Status: **implemented and live** on mitipi.eu in EN, NL, DE, FR and CS on 2026-09-15. Full section copy lives in the repo sources listed under each page; this document records the decisions, the H1 options and scores, the benefits ladders, the meta tags and the before/after for every H1.

Sources of truth: `config/home-{en,nl,de,fr,cs}.json` (homepage), `config/footer-pages-en.json` + `config/i18n/pages-{nl,de,fr,cs}.json` (sub-pages), `config/i18n/{lang}.json` (FAQ, homepage SEO, hero slide 1), `config/product-kevin-plus.json` (product), `scripts/build-locales.mjs` (EN FAQ/SEO). Messaging rules: `03-messaging-rules.md`. Personas: `02-research-and-personas.md`.

## Claims policy applied

- **Removed from copy:** “Prevent the unthinkable / predators, stalkers, violent intruders” (fear-led, rule 1); “100% privacy / 100% security”; “AI-powered / AI-driven / Swiss AI” as a selling point; “jammer-proof” (now “jammer-resilient” / “keeps working when Wi-Fi is jammed”); “setup takes about 60 seconds” (contradicted by Galaxus reviewers); “lifetime membership” (undefined); “award-winning” as a bare adjective in hero copy; the 20% insurance statistic; “virtual roommate”.
- **Kept, verbatim and dated:** Galaxus product test quote, 9 January 2026 (Michael Restin).
- **Kept, flagged “needs verification” (source: kevinswiss.com / previous live site only):** Global DIA Award 2019, Plus X Award 2021, European Security Award 2024; press quotes attributed to TechRadar, Safety Detectives, Le Temps, IoT Now (no URLs on file); “3,500 properties protected” (not used in copy); founder/CEO name Patrick Cotting (kept on careers page, from kevinswiss.com).
- **Honest limits now stated on every relevant page:** one room per device; placement matters; Kevin deters, it does not raise an alarm; built-in voices EN/DE/Swiss German; app EN/DE/FR/NL.

## Scoring method
Each H1 option is scored /10 against the primary persona’s WIIFM from `02-research-and-personas.md`: does it state the benefit in the buyer’s words, does it make clear who it is for, and is it proven by something on the page (rule 2). The top-scoring option is the one implemented.

## Homepage (/)

**Primary persona(s):** P1 burgled homeowner · P2 commuter/holiday household · P5 adult child of a parent alone

### H1 options (scored)

| # | Option | Why | Score |
|---|---|---|---|
| 1 ✅ | Burglars skip homes that look lived-in. Kevin makes yours one of them. | Names the buyer’s own mental model (“looks occupied” — Galaxus review, Interpolis) and the benefit in one line; “yours” makes it personal; proof follows in the lede (Swiss, no camera, jammer-resilient). | 9/10 |
| 2 | For the hours your home is honestly empty: a Swiss device that makes it look lived-in from the street. | Says who (anyone whose home is empty) and the benefit; slightly long for a hero. | 7/10 |
| 3 | Leave home without the second thought. Kevin keeps the lights, shadows and sounds of a lived-in house going. | Leads with the emotional WIIFM (P2/P5) but hides the mechanism until the second sentence. | 7/10 |

**Subhead (implemented):** For families at work, travellers, second-home owners and anyone living alone: one Swiss-made device plays light, moving shadows and everyday sounds by the window — no camera, no microphone, and it keeps running when Wi-Fi is jammed.

### Before / after

| Live before (2026-09-14) | Rewrite (live now) | Why it is better |
|---|---|---|
| Prevent the unthinkable. | Burglars skip homes that look lived-in. Kevin makes yours one of them. | Fear-led (“predators, stalkers”) and abstract; the rewrite states the outcome the buyer is actually searching for. |

### Sections (heading · CTA)

- **hero** — Burglars skip homes that look lived-in. Kevin makes yours one of them. · CTA: Configure & buy Kevin
- **problem** — An empty-looking home is the easiest target on the street.
- **mechanism** — Light. Shadow. Sound.
- **stats** — Believable for weeks, not minutes.
- **jammer** — Jammers blind cameras. Kevin keeps playing.
- **app** — Set it once. It runs itself.
- **authority** — Three jobs. One quiet device.
- **audience** — Every home is sometimes empty.
- **pricing** — One payment. No monitoring fee. Yours for good. · CTA: Configure & buy Kevin
- **specs** — Plug and play. 9 watts. No camera, no microphone.
- **faq** — Questions, answered.
- **cta** — Don't leave your home looking empty tonight. · CTA: Configure & buy Kevin

### Benefits ladder

| Feature | What it does | What it means for the persona |
|---|---|---|
| Light + patented moving shadows + 70+ h sounds from one device | the house glows, moves and sounds occupied from the pavement | P1: “it never looks empty again”; burglars pick another house |
| 32 GB on-device storage | scenes play without Wi-Fi or cloud | P3/P1: works in a chalet with weak Wi-Fi and when cameras are jammed |
| Weekly schedule + geofencing | starts when your phone leaves the area | P2: nothing to remember on the way out |
| No camera, no microphone | nothing is recorded or streamed | P5: “no camera watching my mother” |
| One-time price, 3-year warranty, 30-day returns | no monthly fee, low risk | P1/P2: own it, try it at home |

**Meta title:** Kevin® — Swiss presence simulator that makes your home look lived-in | Mitipi  
**Meta description:** Kevin® plays light, moving shadows and everyday sounds by the window, so burglars see a lived-in home and move on. No camera, no microphone, keeps working when Wi-Fi is jammed. One-time purchase, free EU shipping.

## /pages/features

**Primary persona(s):** P1 burgled homeowner (wants to know it is convincing) · P2 (wants it simple)

### H1 options (scored)

| # | Option | Why | Score |
|---|---|---|---|
| 1 ✅ | Light, moving shadows and everyday sounds — so from the street, someone is home. | Benefit (someone is home) + the three proofs a burglar checks; the lede names who it is for. | 9/10 |
| 2 | Everything a burglar checks from the pavement, played from one Swiss device. | Strong on proof, weaker on stating the outcome for the owner. | 7/10 |
| 3 | Convincing enough to fool a burglar. Private enough for your family. | Emotional balance for P1/P5, but no concrete mechanism in the H1. | 7/10 |

**Subhead (implemented):** For anyone whose home sits empty during the day, on holiday or between visits: Kevin plays the three signs of life a burglar checks for, from one plug-in device. No camera, no microphone, and it keeps running when Wi-Fi is jammed.

### Before / after

| Live before (2026-09-14) | Rewrite (live now) | Why it is better |
|---|---|---|
| Light, shadow, and sound—believable presence without surveillance. | Light, moving shadows and everyday sounds — so from the street, someone is home. | “Believable presence without surveillance” is company language; the rewrite says what the street sees and adds who it is for in the lede. |

### Sections (heading · CTA)

- **Hero** — H1 above; lede: For anyone whose home sits empty during the day, on holiday or between visits: Kevin plays the three signs of life a burglar checks for, from one plug-in device. No camera, no microphone, and it keeps running when Wi-Fi is jammed.
- *section_intro* — Burglars check for light, movement and sound. Kevin gives them all three.
- *image_pillar* — Light that behaves like people
- *image_pillar* — Shadows that move
- *image_pillar* — The sounds of a normal evening
- *stat_row* — 70+ Hours of built-in simulations · 9 W Typical power use · 0 Cameras or microphones
- *section_intro* — An alarm reacts once the door is tested. Kevin works before anyone tries.
- *media_split* — Keeps playing when Wi-Fi is jammed
- *media_split* — Works alongside your alarm
- *section_intro* — No camera. No microphone. Nothing streamed.
- *richtext* — Useful when you are home, too
- **Closing CTA** — See what your street sees. / Buy Kevin outright: free shipping across the EU, 30-day returns, 3-year Swiss warranty. · Primary: **Configure & buy Kevin** · Secondary: See how it works

### Benefits ladder

| Feature | What it does | What it means for the persona |
|---|---|---|
| Patented moving shadows | silhouettes cross the wall behind curtains | P1: looks like people, not a timer |
| 70+ h scenes, up to 4 weeks without repeating | never the same evening twice | P2: a two-week holiday never looks automated |
| Local playback, Wi-Fi only for setup | keeps running when jammed | P1: the layer cameras lack |
| Built-in voices EN/DE/Swiss German + own recordings | sounds like your household | P5: honest limit stated, workaround offered |

**Meta title:** Kevin features: light, moving shadows and sound from one device | Mitipi  
**Meta description:** What Kevin does: warm light scenes, patented moving shadows and 70+ hours of household sounds from 32 GB on-device storage. No camera, no microphone, jammer-resilient. Swiss-engineered, 9 W.

## /pages/how-it-works

**Primary persona(s):** P2 commuter/holiday household · P3 second-home owner

### H1 options (scored)

| # | Option | Why | Score |
|---|---|---|---|
| 1 ✅ | Plug in by the window, set it once, and your home looks lived-in every time you leave. | Three-step promise plus the outcome (“looks lived-in every time you leave”); the lede names commuters, travellers, second-home owners. | 9/10 |
| 2 | Three steps to a home that never looks empty — no wiring, no contract. | Concise, but omits the “set it once” benefit that matters most to P2. | 7/10 |
| 3 | Set it once. Every evening you are away, someone is home. | Emotional and short; mechanism only in the lede. | 8/10 |

**Subhead (implemented):** For commuters, travellers and second-home owners: Kevin runs on a weekly schedule or switches on by itself when your phone leaves the area. Light, shadow and sound play from the device, so it keeps working when Wi-Fi is jammed.

### Before / after

| Live before (2026-09-14) | Rewrite (live now) | Why it is better |
|---|---|---|
| Kevin® simulates people at home—so you can leave calmly. | Plug in by the window, set it once, and your home looks lived-in every time you leave. | “So you can leave calmly” is close, but the rewrite adds the concrete steps and the who; also drops the unverified “60 seconds” setup claim. |

### Sections (heading · CTA)

- **Hero** — H1 above; lede: For commuters, travellers and second-home owners: Kevin runs on a weekly schedule or switches on by itself when your phone leaves the area. Light, shadow and sound play from the device, so it keeps working when Wi-Fi is jammed.
- *section_intro* — Plug in. Choose a routine. Leave.
- *step* — Step 1: Plug in and place
- *step* — Step 2: Set a schedule or use geofencing
- *step* — Step 3: Your home looks lived-in
- *stat_row* — 3 Buttons on the device, no app needed to start · 9 W Typical power use · 32 GB Scenes stored on the device
- *section_intro* — Built for the way you actually leave the house.
- *image_pillar* — Every working day
- *image_pillar* — Holidays and weekends
- *image_pillar* — Second homes and rentals
- *section_intro* — Burglars choose the easy, empty-looking house. Yours is not it.
- *richtext* — Homes, flats, offices and shops
- **Closing CTA** — Ready to leave without the second thought? / Configure your Kevin and check out securely. Free shipping across the EU, 30-day returns, 3-year Swiss warranty. · Primary: **Configure & buy Kevin** · Secondary: Read the setup guide

### Benefits ladder

| Feature | What it does | What it means for the persona |
|---|---|---|
| Geofencing | starts when your phone leaves | P2: leaving in a hurry no longer matters |
| Holiday schedule | light, shadows and TV every evening | P2: no lamp-timer pattern |
| Multi-device app + local playback | one app for chalet, flat, office | P3: weak Wi-Fi on site is not a problem |
| One room per device (stated) | honest scope | P1: knows to add a second unit for a second facade |

**Meta title:** How Kevin works: plug in, schedule, leave | Mitipi  
**Meta description:** Three steps: place Kevin by a window, set a weekly schedule or geofencing in the app, and light, moving shadows and sound play from local storage while you are away. No camera, no microphone.

## /pages/the-kevin-app

**Primary persona(s):** P2 busy household · P5 adult child managing a parent’s home · P3 second-home owner

### H1 options (scored)

| # | Option | Why | Score |
|---|---|---|---|
| 1 ✅ | Protection that switches itself on, so you never have to remember it. | The WIIFM P2 states in reviews (“forget to switch it on”); the lede names busy households and remote carers. | 9/10 |
| 2 | One free app for every home you look after — yours, your parent’s, the holiday flat. | Strong for P5/P3, weaker for the single-home buyer. | 7/10 |
| 3 | Schedules, geofencing and your own sounds. No subscription, nothing to renew. | Feature list; benefit implied only. | 6/10 |

**Subhead (implemented):** For busy households and anyone managing a parent’s or a second home from afar: schedules, geofencing and every device in one free app. No monitoring subscription, and nothing to renew.

### Before / after

| Live before (2026-09-14) | Rewrite (live now) | Why it is better |
|---|---|---|
| Protection that runs while you live your life. | Protection that switches itself on, so you never have to remember it. | The old line is generic; the rewrite states the specific mechanism (switches itself on) and removes “AI” claims that cannot be verified. |

### Sections (heading · CTA)

- **Hero** — H1 above; lede: For busy households and anyone managing a parent’s or a second home from afar: schedules, geofencing and every device in one free app. No monitoring subscription, and nothing to renew.
- *section_intro* — Decide once how your home should behave. Kevin takes it from there.
- *image_pillar* — Weekly schedules
- *image_pillar* — Geofencing
- *image_pillar* — Every home in one app
- *media_split* — Your household, your sounds
- *media_split* — Nothing is watched or streamed
- *section_intro* — Pair once after unboxing.
- *step* — Step 1: Download the Kevin app
- *step* — Step 2: Pair your device
- *step* — Step 3: Choose a routine
- **Closing CTA** — One device, one app, no subscription. / Buy Kevin outright with free shipping across the EU, 30-day returns and a 3-year Swiss warranty. · Primary: **Configure & buy Kevin** · Secondary: Read the setup guide

### Benefits ladder

| Feature | What it does | What it means for the persona |
|---|---|---|
| Weekly schedules | runs the hours that matter | P2: nothing to remember |
| Geofencing | starts when the phone leaves | P2: leave-and-forget |
| Multi-device | every home in one app | P5: manage Mum’s flat from afar |
| Own recordings | your household sounds | P1: sounds like your home |
| App in EN/DE/FR/NL (stated) | honest limit | P4/FR buyers: know before buying |

**Meta title:** The Kevin app: schedules, geofencing, every home in one place | Mitipi  
**Meta description:** The free Kevin app sets weekly schedules, starts Kevin by geofencing when you leave, lets you record your own household sounds and manages several devices. Available in English, German, French and Dutch.

## /pages/pricing

**Primary persona(s):** P1/P2 comparing with monitored alarms; anyone suspicious of subscriptions

### H1 options (scored)

| # | Option | Why | Score |
|---|---|---|---|
| 1 ✅ | One payment of €579.95. No monitoring fee, ever. | States the number and the strongest objection-killer (no monitoring fee) for buyers suspicious of subscriptions. | 9/10 |
| 2 | Own your security for €579.95. No monthly fee, ever. | Same idea, “own” resonates with P1; slightly less direct. | 8/10 |
| 3 | Everything included, one payment: Kevin, the app, updates and a 3-year warranty. | Lists inclusions; less punchy. | 7/10 |

**Subhead (implemented):** For homeowners who would rather own their security than rent it: Kevin, the app, 70+ hours of simulations and lifetime software updates in one purchase. Free shipping across the EU, 30-day returns, 3-year Swiss warranty.

### Before / after

| Live before (2026-09-14) | Rewrite (live now) | Why it is better |
|---|---|---|
| One-time purchase. Lifetime updates included. | One payment of €579.95. No monitoring fee, ever. | The rewrite adds the price and the no-fee promise; drops “lifetime membership”, which is undefined on the site. |

### Sections (heading · CTA)

- **Hero** — H1 above; lede: For homeowners who would rather own their security than rent it: Kevin, the app, 70+ hours of simulations and lifetime software updates in one purchase. Free shipping across the EU, 30-day returns, 3-year Swiss warranty.
- *section_intro* — Everything needed to make an empty home look lived-in.
- *richtext* — Included with Kevin
- *stat_row* — 3 yr Swiss warranty · 30 Day returns · €0 Monthly fees
- *section_intro* — Pricing FAQ
- *faq* — FAQ: Is there a subscription?
- *faq* — FAQ: How does it compare with a monitored alarm?
- *faq* — FAQ: Where is shipping free?
- *faq* — FAQ: What if I change my mind?
- *richtext* — Secure checkout
- **Closing CTA** — Own it. No renewals, no reminders. / Choose a front cover and continue to secure checkout. · Primary: **Configure & buy Kevin** · Secondary: See the features

### Benefits ladder

| Feature | What it does | What it means for the persona |
|---|---|---|
| One payment €579.95 | no plan, no renewal | buyer: no surprise costs |
| Lifetime software updates | device improves | P1: it will not be obsolete |
| 3-year Swiss warranty + 30-day returns | low risk | P2: try it at your own window |
| Free shipping EU/CH/LI/NO/IS | no extra cost at checkout | all markets |

**Meta title:** Kevin price: €579.95 one-time, no subscription | Mitipi  
**Meta description:** Kevin 3 costs €579.95 once. Included: the app, 70+ hours of simulations, lifetime updates, 3-year Swiss warranty, 30-day returns and free shipping across the EU, Switzerland, Norway and Iceland. Colour front covers €29.95.

## /pages/about-kevin

**Primary persona(s):** Trust-seekers after a fake-ratings story (Galaxus, Feb 2026); P5 checking who is behind it

### H1 options (scored)

| # | Option | Why | Score |
|---|---|---|---|
| 1 ✅ | We build prevention, not surveillance. Swiss engineering for homes that look lived-in. | Positions the company on the buyer’s value (prevention, privacy) and names the proof (Swiss engineering). | 8/10 |
| 2 | The Swiss company that stops break-ins before they start, without watching your family. | Emotional and clear on who; “stops” is a strong claim. | 7/10 |
| 3 | Mitipi: Swiss prevention-first security since 2018. | Short and factual, weak on benefit. | 6/10 |

**Subhead (implemented):** Mitipi AG in Fribourg develops Kevin, the presence simulator that makes homes, flats, offices and holiday properties look occupied from the street. Since 2018, one idea: stop the break-in before it starts, without a camera watching your family.

### Before / after

| Live before (2026-09-14) | Rewrite (live now) | Why it is better |
|---|---|---|
| Swiss innovation for prevention-first home security. | We build prevention, not surveillance. Swiss engineering for homes that look lived-in. | “Swiss innovation for prevention-first home security” is a slogan; the rewrite says what the company refuses to do (surveillance) and what it builds. |

### Sections (heading · CTA)

- **Hero** — H1 above; lede: Mitipi AG in Fribourg develops Kevin, the presence simulator that makes homes, flats, offices and holiday properties look occupied from the street. Since 2018, one idea: stop the break-in before it starts, without a camera watching your family.
- *section_intro* — Everyone deserves to leave home without the second thought.
- *richtext* — Prevention, not surveillance
- *stat_row* — 0 Cameras or microphones · CH Engineered and designed in Switzerland · 2018 Mitipi founded
- *section_intro* — From an idea in Zurich to homes across Europe.
- *step* — Step 2017: The idea
- *step* — Step 2019: Kevin launches in Switzerland
- *step* — Step 2021: Kevin.2
- *step* — Step 2023: Kevin.3
- *step* — Step 2024: European Security Award
- *media_split* — Tested, not just claimed
- *richtext* — Mitipi AG
- **Closing CTA** — Put prevention in front of your alarm. / Free shipping across the EU, 30-day returns, 3-year Swiss warranty. · Primary: **Configure & buy Kevin** · Secondary: Press & media

### Benefits ladder

| Feature | What it does | What it means for the persona |
|---|---|---|
| Founded 2018 in Switzerland, based at Bluefactory Fribourg | a real company with an address | P5: someone to call |
| No camera, no microphone by design | privacy is a principle, not a setting | P5/P6 |
| Galaxus product test (dated) + limits stated | tested, not just claimed | trust after fake-ratings story |

**Meta title:** About Mitipi: the Swiss company behind Kevin | Mitipi  
**Meta description:** Mitipi AG, Fribourg, Switzerland, develops Kevin, a presence simulator that deters burglary with light, moving shadows and sound. Founded 2018. No cameras, no microphones, engineered in Switzerland.

## /pages/press

**Primary persona(s):** Journalists; buyers looking for third-party proof

### H1 options (scored)

| # | Option | Why | Score |
|---|---|---|---|
| 1 ✅ | Kevin in the press: the Swiss answer to burglary that does not need a camera. | Gives the angle a journalist can use (Swiss, no camera) and the reader a reason to trust. | 8/10 |
| 2 | What reviewers found when they tested Kevin. | Direct, proof-led; less useful for journalists. | 7/10 |
| 3 | Press and reviews: the Swiss presence simulator, tested. | Shortest; least specific. | 6/10 |

**Subhead (implemented):** Coverage, reviews and interviews about Mitipi and Kevin. Journalists can request product photos, a fact sheet and interviews with the Mitipi team.

### Before / after

| Live before (2026-09-14) | Rewrite (live now) | Why it is better |
|---|---|---|
| Kevin® in the press. | Kevin in the press: the Swiss answer to burglary that does not need a camera. | “Kevin in the press.” is a label; the rewrite carries the story angle and the differentiator. |

### Sections (heading · CTA)

- **Hero** — H1 above; lede: Coverage, reviews and interviews about Mitipi and Kevin. Journalists can request product photos, a fact sheet and interviews with the Mitipi team.
- *section_intro* — What reviewers found when they tested Kevin.
- *quote* — Quote: Galaxus — Kevin.3 product test, 9 January 2026
- *quote* — Quote: Safety Detectives — interview with Dr. Patrick Cotting, CEO, Mitipi AG
- *quote* — Quote: TechRadar — Kevin.3 review
- *quote* — Quote: Mitipi — product launch announcement
- *quote* — Quote: Le Temps — Mitipi & Swiss AI Center
- *quote* — Quote: IoT Now — KEVIN® feature
- *section_intro* — Recognised for prevention-first innovation.
- *stat_row* — 2024 European Security Award · 2021 Plus X Award (Germany) · 2019 Global DIA Award
- *contact_row* — Contact row (emails/addresses unchanged)
- **Closing CTA** — Writing about home security? / Product photos, fact sheet and interview availability on request. · Primary: **Request the press kit** · Secondary: About Mitipi

### Benefits ladder

| Feature | What it does | What it means for the persona |
|---|---|---|
| Dated Galaxus quote first | verifiable, recent | buyer: third-party proof |
| Existing press quotes kept verbatim | continuity | flagged: undated sources need links |
| Awards listed with years | recognition | needs verification: sources are kevinswiss.com only |

**Meta title:** Kevin press & media: reviews, coverage, press kit | Mitipi  
**Meta description:** What the press says about Kevin, the Swiss presence simulator: Galaxus product test, TechRadar, Le Temps, Safety Detectives and more. Press kit and interviews on request.

## /pages/careers

**Primary persona(s):** Candidates who care about privacy and hardware

### H1 options (scored)

| # | Option | Why | Score |
|---|---|---|---|
| 1 ✅ | Help more families leave home without worrying about it. | Mission-as-benefit for the candidate, names the people they help. | 8/10 |
| 2 | Build the device that makes homes look lived-in — without cameras. | Concrete product; less human. | 7/10 |
| 3 | Join a small Swiss team building prevention, not surveillance. | Clear positioning; generic “join”. | 6/10 |

**Subhead (implemented):** Mitipi is a small Swiss team building Kevin, the presence simulator that prevents burglary without cameras. If you build hardware, apps, sound or stories, we would like to hear from you.

### Before / after

| Live before (2026-09-14) | Rewrite (live now) | Why it is better |
|---|---|---|
| Build the future of prevention-first security. | Help more families leave home without worrying about it. | “Build the future of prevention-first security” is company language; the rewrite says who benefits. |

### Sections (heading · CTA)

- **Hero** — H1 above; lede: Mitipi is a small Swiss team building Kevin, the presence simulator that prevents burglary without cameras. If you build hardware, apps, sound or stories, we would like to hear from you.
- *section_intro* — Safety without surveillance.
- *pillar* — Growth
- *pillar* — Security
- *pillar* — Ideas
- *section_intro* — Small team, one product, real homes.
- *media_split* — What we work on
- *richtext* — Open roles
- *contact_row* — Contact row (emails/addresses unchanged)
- **Closing CTA** — Introduce yourself. / Tell us what you build and why Kevin matters to you. · Primary: **Email careers** · Secondary: About Mitipi

### Benefits ladder

| Feature | What it does | What it means for the persona |
|---|---|---|
| Small team, real homes | work ships fast | candidate: impact |
| Privacy-first product | no data trade | candidate: values |
| Open application | low friction | candidate: clear next step |

**Meta title:** Careers at Mitipi, Fribourg | Mitipi  
**Meta description:** Work on Kevin, the Swiss presence simulator that prevents burglary without cameras. Hardware, mobile apps, sound design and marketing roles at Mitipi AG in Fribourg. Send an open application.

## /pages/setup-guide

**Primary persona(s):** New owners (P1/P2); Galaxus reviewers reported setup and app friction

### H1 options (scored)

| # | Option | Why | Score |
|---|---|---|---|
| 1 ✅ | Set up Kevin in four steps and check the result from your own pavement. | Promises a bounded task and the test that proves it worked (“from your own pavement”). | 9/10 |
| 2 | Place it right, pair once, and check what your street sees. | Same content, slightly less clear as a guide title. | 8/10 |
| 3 | Kevin setup: window, app, routine, test. | Scannable but cold. | 6/10 |

**Subhead (implemented):** For new owners: where to place Kevin, how to pair the app once, and how to see what a passer-by sees after dark. No tools, no wiring.

### Before / after

| Live before (2026-09-14) | Rewrite (live now) | Why it is better |
|---|---|---|
| Plug in. Schedule. Leave with peace of mind. | Set up Kevin in four steps and check the result from your own pavement. | The old H1 repeats the how-it-works page and claims “60 seconds”; the rewrite is task-specific and honest about placement. |

### Sections (heading · CTA)

- **Hero** — H1 above; lede: For new owners: where to place Kevin, how to pair the app once, and how to see what a passer-by sees after dark. No tools, no wiring.
- *section_intro* — Four steps to a home that looks lived-in.
- *step* — Step 1: Unbox and place
- *step* — Step 2: Pair the app
- *step* — Step 3: Choose a routine
- *step* — Step 4: Test from outside
- *section_intro* — Where Kevin works best.
- *media_split* — Give the shadows a surface
- *media_split* — Start with geofencing
- *section_intro* — Setup FAQ
- *faq* — FAQ: Does Kevin need Wi-Fi to run?
- *faq* — FAQ: Can I add my own sounds?
- *faq* — FAQ: Something is not working. What now?
- *richtext* — Warranty and service
- **Closing CTA** — Need a hand with placement? / Send us a photo of the room and we will tell you where Kevin works best. · Primary: **Contact support** · Secondary: Configure & buy Kevin

### Benefits ladder

| Feature | What it does | What it means for the persona |
|---|---|---|
| Placement rules (window, wall, sheer curtains) | the effect is visible from outside | P1: it works on my street |
| Three device buttons | runs without the app | P5: parent can use it |
| Test-from-outside step | owner sees the result | all: confidence on day one |
| Serial number + email path | clear support route | reduces the friction reviewers reported |

**Meta title:** Kevin setup guide: placement, pairing, first test | Mitipi  
**Meta description:** Set up Kevin in four steps: place it by a street-facing window with a wall for shadows, pair the app over Wi-Fi or Bluetooth, choose a schedule or geofencing, then test from outside after dark.

## /pages/contact

**Primary persona(s):** Buyers with an order, placement or warranty question

### H1 options (scored)

| # | Option | Why | Score |
|---|---|---|---|
| 1 ✅ | Talk to the people who build Kevin. | Human and specific (the builders, not a call centre); the lede lists what you can ask. | 8/10 |
| 2 | Questions about your order, placement or warranty? Email the Mitipi team in Fribourg. | Very clear, but long for an H1. | 8/10 |
| 3 | We reply from Fribourg. | Charming, but says nothing about what for. | 5/10 |

**Subhead (implemented):** Questions about your order, placement, the app or the warranty? Email us and a member of the Mitipi team in Fribourg replies.

### Before / after

| Live before (2026-09-14) | Rewrite (live now) | Why it is better |
|---|---|---|
| We are here to help. | Talk to the people who build Kevin. | “We are here to help.” is generic; the rewrite tells the reader who answers and what to ask. |

### Sections (heading · CTA)

- **Hero** — H1 above; lede: Questions about your order, placement, the app or the warranty? Email us and a member of the Mitipi team in Fribourg replies.
- *contact_row* — Contact row (emails/addresses unchanged)
- *section_intro* — Quick answers before you write.
- *faq* — FAQ: How do I order Kevin?
- *faq* — FAQ: I need help with placement or the app.
- *faq* — FAQ: My Kevin stopped working.
- *faq* — FAQ: Press or partnership request?
- *richtext* — Orders and checkout
- *richtext* — Warranty repairs
- **Closing CTA** — Ready to buy? / Choose a front cover and continue to secure checkout. · Primary: **Configure & buy Kevin** · Secondary: Read the setup guide

### Benefits ladder

| Feature | What it does | What it means for the persona |
|---|---|---|
| Direct email to the team | a person replies | trust |
| Placement help from a photo | tailored advice | P1: works at my window |
| Warranty path with serial number | clear process | low risk |

**Meta title:** Contact Mitipi: support, orders, press | Mitipi  
**Meta description:** Contact the Mitipi team in Fribourg, Switzerland, about Kevin orders, setup, warranty and press requests. Company register CHE-356.372.981.

## Product page (/products/kevin-plus)

**Primary persona:** buyer arriving from search or the configure page, comparing with alarms and cameras.

| # | Option | Why | Score |
|---|---|---|---|
| 1 ✅ | KEVIN® 3 presence simulator — makes your home look lived-in | Category keyword + benefit; the description opens with the buyer’s mental model. | 9/10 |
| 2 | KEVIN® 3 — the Swiss device that makes an empty home look occupied | Benefit-led, no category keyword for search. | 8/10 |
| 3 | KEVIN® 3 | Smart Home Security That Makes Your Home Look Lived-In | Previous title: “smart home security” invites comparison with cameras and alarms Kevin is not. | 5/10 |

| Live before | Rewrite | Why |
|---|---|---|
| KEVIN® 3 \| Smart Home Security That Makes Your Home Look Lived-In | KEVIN® 3 presence simulator — makes your home look lived-in | Names the category buyers search for (presence simulator) and drops the misleading “smart home security” frame. |

**Meta title:** KEVIN® 3 presence simulator: light, moving shadows and sound | Mitipi  
**Meta description:** Swiss-engineered presence simulator. Light, patented moving shadows and 70+ hours of household sounds from the device, so burglars see a lived-in home. No camera, no microphone, jammer-resilient. €579.95, free EU shipping.

Description rewritten in EN/NL/DE/FR/CS (`config/product-kevin-plus.json`): removes “AI-powered”, “jammer-proof”, “100% private”, “costs pennies”; adds the one-room limit, voice/app languages and the full inclusions list. Localized product handles: nl `aanwezigheidssimulator`, fr `simulateur-de-presence`, de `anwesenheitssimulator`, cs `simulator-pritomnosti`.

## Configure page (/pages/configure)

Rewritten in the previous round (WIIFM USPs, “Free shipping anywhere in the EU” bar); unchanged here except the localized handle (nl `configureren`, fr `configurer`, de `konfigurieren`, cs `konfigurace`).

## Needs verification (left out of copy)

| Claim | Where it appeared | What is needed |
|---|---|---|
| 20% of Swiss homeowners with a presence simulator get an insurance discount | previous homepage | Source from an insurer; removed. |
| Awards: DIA 2019, Plus X 2021, European Security Award 2024 | about, press | Award pages or certificates; kept on about/press pages only, sourced from kevinswiss.com. |
| Press quotes (TechRadar, Safety Detectives, Le Temps, IoT Now) | press | Article URLs and dates; kept verbatim, undated. |
| “Setup in about 60 seconds” | how-it-works, setup guide | Reviewer reports contradict it; replaced with a four-step guide. |
| “3,500 properties protected in Switzerland” | kevinswiss.com | Company figure; not used. |
| Patent for moving shadows | product facts | Patent number for a footnote; wording kept as “patented moving shadows” as on the live site. |
