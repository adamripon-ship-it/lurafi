# Homepage video analytics

`sections/lp-video.liquid` publishes Shopify **custom events** while the brand
film plays. The Google & YouTube app pixel (GA4 `G-13FFRZZ3QJ`) only forwards
Shopify's standard events, so a small **custom pixel** forwards these to the same
GA4 property.

| Theme event (Shopify)    | GA4 event         | Extra params                         |
| ------------------------ | ----------------- | ------------------------------------ |
| `kevin_video_start`      | `video_start`     | `replay` (true when "Watch again")   |
| `kevin_video_progress`   | `video_progress`  | `video_percent` (25 / 50 / 75)       |
| `kevin_video_complete`   | `video_complete`  |                                      |
| `kevin_video_cta_click`  | `video_cta_click` | `link_url`                           |

Every event also carries `video_title`, `video_duration`, `video_current_time`,
`locale` and `replay`.

## One-time setup (Shopify admin)

1. Admin → **Settings → Customer events → Add custom pixel**, name it
   `KEVIN video → GA4`.
2. **Customer privacy:** Permission = *Required* → **Analytics**; Data sale =
   *Data collected does not qualify as data sale*.
3. Paste the code below, **Save**, then **Connect**.

```js
// KEVIN homepage video events → GA4 (same property as the Google & YouTube app)
const GA_ID = 'G-13FFRZZ3QJ';
const EVENTS = {
  kevin_video_start: 'video_start',
  kevin_video_progress: 'video_progress',
  kevin_video_complete: 'video_complete',
  kevin_video_cta_click: 'video_cta_click',
};

const tag = document.createElement('script');
tag.async = true;
tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
document.head.appendChild(tag);
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// Reuse the storefront's GA client id (cookie "_ga" = GA1.1.<id>) so video
// events join the same visitor as page views and purchases where possible.
const ready = browser.cookie.get('_ga').then((ga) => {
  const clientId = ga ? ga.split('.').slice(-2).join('.') : undefined;
  gtag('js', new Date());
  gtag('config', GA_ID, { send_page_view: false, client_id: clientId });
}).catch(() => {
  gtag('js', new Date());
  gtag('config', GA_ID, { send_page_view: false });
});

Object.keys(EVENTS).forEach((name) => {
  analytics.subscribe(name, (event) => {
    const d = event.customData || {};
    ready.then(() => gtag('event', EVENTS[name], {
      video_title: d.video_title,
      video_duration: d.video_duration,
      video_current_time: d.video_current_time,
      video_percent: d.video_percent,
      replay: d.replay,
      link_url: d.link_url,
      locale: d.locale,
      page_location: event.context && event.context.document && event.context.document.location.href,
    }));
  });
});
```

## Checking it works

- Admin → Customer events → the pixel → **Test**, open the homepage, play the
  film: `kevin_video_*` events appear in the test panel.
- GA4 → **Reports → Realtime** shows `video_start` / `video_progress` within a
  minute. Standard reports fill in after 24–48 h.
- Useful GA4 numbers: plays ÷ homepage page views (play rate),
  `video_complete` ÷ `video_start` (completion), `video_cta_click` ÷
  `video_complete` (end-card CTR).
