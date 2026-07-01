#!/usr/bin/env node
/**
 * Phase A: Create mitipi.eu Navigation menus and wire theme header/footer group JSON.
 *
 *   npm run cms:navigation
 *
 * Creates (or updates) menus in Shopify Admin, then writes menu handles into
 * sections/header-group.json and sections/footer-group.json for theme push.
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminGql } from './lib/shopify-admin-gql.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');

/** @type {Record<string, { title: string, items: { title: string, url: string }[] }>} */
const MENUS = {
  'main-menu': {
    title: 'Main menu',
    items: [
      { title: 'Why Kevin', url: '/#problem' },
      { title: 'Product', url: '/#product' },
      { title: 'How it works', url: '/#how-it-works' },
      { title: 'App', url: '/#app' },
      { title: 'Pricing', url: '/#pricing' },
    ],
  },
  'footer-product': {
    title: 'Footer — Product',
    items: [
      { title: 'Features', url: '/pages/features' },
      { title: 'How It Works', url: '/pages/how-it-works' },
      { title: 'The App', url: '/pages/the-kevin-app' },
      { title: 'Pricing', url: '/pages/pricing' },
    ],
  },
  'footer-company': {
    title: 'Footer — Company',
    items: [
      { title: 'About Kevin', url: '/pages/about-kevin' },
      { title: 'Press', url: '/pages/press' },
      { title: 'Careers', url: '/pages/careers' },
    ],
  },
  'footer-support': {
    title: 'Footer — Support',
    items: [
      { title: 'Setup Guide', url: '/pages/setup-guide' },
      { title: 'Contact Us', url: '/pages/contact' },
    ],
  },
  'footer-shop': {
    title: 'Footer — Where to buy',
    items: [
      { title: 'Configure Kevin', url: '/pages/configure' },
      { title: 'Cart', url: '/cart' },
    ],
  },
};

function toMenuItems(items) {
  return items.map((item) => ({
    title: item.title,
    type: 'HTTP',
    url: item.url,
  }));
}

async function listMenus() {
  const { menus } = await adminGql({
    store: STORE,
    query: `query {
      menus(first: 50) {
        nodes { id handle title }
      }
    }`,
  });
  return menus.nodes;
}

async function createMenu(handle, { title, items }) {
  const { menuCreate } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
      menuCreate(title: $title, handle: $handle, items: $items) {
        menu { id handle title }
        userErrors { field message }
      }
    }`,
    variables: {
      title,
      handle,
      items: toMenuItems(items),
    },
  });
  if (menuCreate.userErrors?.length) {
    throw new Error(menuCreate.userErrors.map((e) => e.message).join('; '));
  }
  return menuCreate.menu;
}

async function updateMenu(id, { title, items }) {
  const { menuUpdate } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
      menuUpdate(id: $id, title: $title, items: $items) {
        menu { id handle title }
        userErrors { field message }
      }
    }`,
    variables: {
      id,
      title,
      items: toMenuItems(items),
    },
  });
  if (menuUpdate.userErrors?.length) {
    throw new Error(menuUpdate.userErrors.map((e) => e.message).join('; '));
  }
  return menuUpdate.menu;
}

function writeThemeGroupAssignments() {
  const headerPath = path.join(ROOT, 'sections/header-group.json');
  const footerPath = path.join(ROOT, 'sections/footer-group.json');

  const headerGroup = JSON.parse(fs.readFileSync(headerPath, 'utf8'));
  headerGroup.sections.header.settings = {
    ...headerGroup.sections.header.settings,
    main_menu: 'main-menu',
  };
  fs.writeFileSync(headerPath, `${JSON.stringify(headerGroup, null, 2)}\n`);

  const footerGroup = {
    type: 'footer',
    name: 'Footer group',
    sections: {
      footer: {
        type: 'footer',
        settings: {
          menu_product: 'footer-product',
          menu_company: 'footer-company',
          menu_support: 'footer-support',
          menu_shop: 'footer-shop',
        },
      },
    },
    order: ['footer'],
  };
  fs.writeFileSync(footerPath, `${JSON.stringify(footerGroup, null, 2)}\n`);

  console.log('  wrote sections/header-group.json (main_menu → main-menu)');
  console.log('  wrote sections/footer-group.json (4 footer menus assigned)');
}

async function main() {
  console.log(`CMS navigation setup — ${STORE}\n`);

  const existing = await listMenus();
  const byHandle = Object.fromEntries(existing.map((m) => [m.handle, m]));

  for (const [handle, def] of Object.entries(MENUS)) {
    const found = byHandle[handle];
    if (found) {
      await updateMenu(found.id, def);
      console.log(`✓ Updated menu ${handle} (${def.items.length} links)`);
    } else {
      await createMenu(handle, def);
      console.log(`✓ Created menu ${handle} (${def.items.length} links)`);
    }
  }

  writeThemeGroupAssignments();

  console.log('\nNext steps:');
  console.log('  1. npm run theme:push:live');
  console.log('  2. In Customize, confirm Header/Footer show the assigned menus');
  console.log('  3. Markets → translate menu link titles for NL / FR / DE / CS');
  console.log('  See docs/CMS-ADMIN-SETUP-CHECKLIST.md');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
