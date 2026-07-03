#!/usr/bin/env node
/**
 * Create the CMS metaobject definitions (idempotent — skips existing types).
 * Requires SHOPIFY_ADMIN_TOKEN (or client credentials) in .env — see
 * scripts/lib/shopify-admin-gql.mjs and docs/CMS-BACKEND-PLAN.md §4.
 *
 *   node scripts/setup-metaobjects.mjs          # create missing definitions
 *   node scripts/setup-metaobjects.mjs --dry    # print what would be created
 */
import { adminGql } from './lib/shopify-admin-gql.mjs';

const dry = process.argv.includes('--dry');

const text = (key, name, required = false) => ({
  key,
  name,
  type: 'single_line_text_field',
  required,
});
const longText = (key, name) => ({ key, name, type: 'multi_line_text_field' });
const image = (key, name) => ({ key, name, type: 'file_reference' });
const number = (key, name) => ({ key, name, type: 'number_integer' });
const url = (key, name) => ({ key, name, type: 'url' });

/** Rendered by sections via shop.metaobjects.<type>.values — keep keys in sync with liquid. */
const DEFINITIONS = [
  {
    type: 'persona',
    name: 'Persona',
    fieldDefinitions: [text('title', 'Title', true), longText('body', 'Body'), longText('quote', 'Quote'), image('image', 'Image'), number('sort', 'Sort order')],
  },
  {
    type: 'testimonial',
    name: 'Testimonial',
    fieldDefinitions: [longText('quote', 'Quote'), text('author', 'Author'), text('location', 'Location'), number('sort', 'Sort order')],
  },
  {
    type: 'faq_item',
    name: 'FAQ item',
    fieldDefinitions: [text('question', 'Question', true), longText('answer', 'Answer'), number('sort', 'Sort order')],
  },
  {
    type: 'spec_row',
    name: 'Spec row',
    fieldDefinitions: [text('label', 'Label', true), text('value', 'Value', true), number('sort', 'Sort order')],
  },
  {
    type: 'press_item',
    name: 'Press item',
    fieldDefinitions: [text('outlet', 'Outlet', true), image('logo', 'Logo'), url('link', 'Link'), longText('quote', 'Quote')],
  },
  {
    type: 'trust_badge',
    name: 'Trust badge',
    fieldDefinitions: [text('label', 'Label', true), image('icon', 'Icon'), number('sort', 'Sort order')],
  },
];

async function existingType(type) {
  const res = await adminGql({
    query: `query($type: String!) { metaobjectDefinitionByType(type: $type) { id type } }`,
    variables: { type },
  });
  return res?.data?.metaobjectDefinitionByType;
}

async function createDefinition(def) {
  const res = await adminGql({
    mutate: true,
    query: `mutation($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition { id type }
        userErrors { field message }
      }
    }`,
    variables: {
      definition: {
        type: def.type,
        name: def.name,
        access: { storefront: 'PUBLIC_READ' },
        capabilities: { translatable: { enabled: true }, publishable: { enabled: true } },
        fieldDefinitions: def.fieldDefinitions.map(({ key, name, type, required }) => ({
          key,
          name,
          type,
          required: Boolean(required),
        })),
      },
    },
  });
  const payload = res?.data?.metaobjectDefinitionCreate;
  if (payload?.userErrors?.length) {
    throw new Error(`${def.type}: ${JSON.stringify(payload.userErrors)}`);
  }
  return payload?.metaobjectDefinition;
}

let created = 0;
for (const def of DEFINITIONS) {
  const existing = await existingType(def.type);
  if (existing) {
    console.log(`= ${def.type} exists (${existing.id})`);
    continue;
  }
  if (dry) {
    console.log(`+ would create ${def.type} (${def.fieldDefinitions.length} fields)`);
    continue;
  }
  const madeDef = await createDefinition(def);
  console.log(`+ created ${def.type} (${madeDef?.id})`);
  created += 1;
}
console.log(dry ? 'Dry run complete.' : `Done — ${created} definition(s) created.`);
