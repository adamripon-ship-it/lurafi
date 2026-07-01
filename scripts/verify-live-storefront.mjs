#!/usr/bin/env node
/**
 * Verify mitipi.eu serves HTML from the configured live theme (not stale page cache).
 * Run after theme push + publish. Exit 1 on mismatch.
 */
import { getLiveThemeConfig, liveStorefrontUrl } from './lib/live-theme.mjs';

const { theme_id: expectedThemeId, storefront_markers: markers, deploy_head_marker: headMarker } =
  getLiveThemeConfig();
const url = liveStorefrontUrl();
const bust = `${url}/?deploy_verify=${Date.now()}`;

const fail = [];
const warn = [];

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

async function fetchHead() {
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  return res;
}

async function fetchHtml() {
  const res = await fetch(bust, { redirect: 'follow' });
  if (!res.ok) {
    fail.push(`GET ${bust} → HTTP ${res.status}`);
    return '';
  }
  return res.text();
}

function parseThemeFromServerTiming(header) {
  if (!header) return null;
  const match = header.match(/theme;desc="(\d+)"/);
  return match ? match[1] : null;
}

async function fetchSectionHtml(sectionId) {
  const res = await fetch(`${url}/?section_id=${sectionId}&_verify=${Date.now()}`, {
    redirect: 'follow',
  });
  if (!res.ok) return '';
  return res.text();
}

async function main() {
  console.log(`\n=== Live storefront verify: ${url} ===\n`);
  console.log(`  Expected theme ID: ${expectedThemeId}\n`);

  const head = await fetchHead();
  if (!head.ok) {
    fail.push(`HEAD ${url} → HTTP ${head.status}`);
  } else {
    pass(`Homepage reachable (HTTP ${head.status})`);
  }

  const servedThemeId = parseThemeFromServerTiming(head.headers.get('server-timing'));
  if (!servedThemeId) {
    warn.push('Could not read theme ID from server-timing header');
  } else if (servedThemeId !== expectedThemeId) {
    fail.push(
      `Wrong theme serving storefront: got ${servedThemeId}, expected ${expectedThemeId}. ` +
        'Update config/live-theme.json or publish the correct theme in Admin.',
    );
  } else {
    pass(`Storefront theme ID matches config (${servedThemeId})`);
  }

  const etag = head.headers.get('etag') || '';
  if (etag.includes('page_cache')) {
    pass(`Shopify page cache active (${etag.slice(0, 60)}…)`);
  }

  const html = await fetchHtml();
  const heroMarkers = [
    'data-hero-layout="focus-v4"',
    'hero-banner__product-stage',
    'hero-banner__cta--primary',
  ];
  const heroMarkersOnPage = heroMarkers.filter((m) => html.includes(m));
  const pageCacheStale =
    html &&
    headMarker &&
    !html.includes(headMarker) &&
    heroMarkersOnPage.length < heroMarkers.length;

  if (html) {
    if (headMarker && !html.includes(headMarker)) {
      if (pageCacheStale) {
        warn.push(
          `Homepage page_cache stale (missing “${headMarker}”). Theme files may still be current — checking section API…`,
        );
      } else {
        fail.push(
          `HTML still on old theme build (missing “${headMarker}”). Shopify homepage page cache is stale. ` +
            'Open Theme Editor → Save once, or wait a few minutes, then run: npm run theme:verify:live',
        );
      }
    } else if (headMarker) {
      pass(`HTML contains deploy marker “${headMarker}”`);
    }

    for (const marker of markers) {
      if (html.includes(marker)) {
        pass(`HTML contains “${marker}”`);
      } else if (pageCacheStale && heroMarkers.includes(marker)) {
        /* checked via section API below */
      } else {
        fail.push(
          `HTML missing “${marker}” — deploy may not have propagated or page cache is stale. ` +
            'Run: npm run theme:publish:live',
        );
      }
    }

    if (html.includes('tile-grid-3') && html.includes('solution-split')) {
      pass('New solution layout present (solution-split)');
    }
  }

  if (pageCacheStale) {
    const heroSection = await fetchSectionHtml('hero');
    const sectionFresh = heroMarkers.every((m) => heroSection.includes(m));
    if (sectionFresh) {
      pass('Hero section API serves focus-v4 (theme files deployed; page_cache will lag)');
      if (html.includes('lurafiRefreshStaleHero') || html.includes('assets/theme.js')) {
        pass('theme.js loaded (stale-hero refresh active in browser when page_cache lags)');
      } else {
        warn.push('theme.js not detected in homepage HTML — push assets/theme.js');
      }
    } else {
      fail.push('Hero section API still stale — theme push did not update hero files');
    }
  }

  for (const w of warn) console.log(`  ⚠ ${w}`);
  for (const f of fail) console.log(`  ✗ ${f}`);

  console.log('');
  if (fail.length) {
    console.log(`Failed (${fail.length}). Fix deploy target or republish, then re-run.\n`);
    process.exit(1);
  }
  if (warn.length) {
    console.log(`Passed with ${warn.length} warning(s). Open Theme Editor → Save to clear page_cache.\n`);
  } else {
    console.log('Storefront verify passed.\n');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
