/**
 * Admin GraphQL via access token (preferred) or shopify store execute (CLI session).
 * Refreshes SHOPIFY_ADMIN_TOKEN from client credentials when the token is missing or expired.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

export function getAdminToken() {
  return (
    process.env.SHOPIFY_ADMIN_TOKEN ||
    process.env.SHOPIFY_CLI_THEME_TOKEN ||
    process.env.SHOPIFY_THEME_PASSWORD ||
    ''
  );
}

async function refreshAdminTokenFromClientCredentials() {
  const id = process.env.SHOPIFY_CLIENT_ID;
  const secret = process.env.SHOPIFY_CLIENT_SECRET;
  const store = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  if (!id || !secret) return null;
  const res = await fetch(`https://${store}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: id,
      client_secret: secret,
    }),
  });
  const payload = await res.json();
  if (!payload.access_token) return null;
  process.env.SHOPIFY_ADMIN_TOKEN = payload.access_token;
  const envPath = join(ROOT, '.env');
  if (existsSync(envPath)) {
    const text = readFileSync(envPath, 'utf8');
    const line = `SHOPIFY_ADMIN_TOKEN=${payload.access_token}`;
    const next = /^SHOPIFY_ADMIN_TOKEN=/m.test(text)
      ? text.replace(/^SHOPIFY_ADMIN_TOKEN=.*$/m, line)
      : `${text.trimEnd()}\n${line}\n`;
    writeFileSync(envPath, next);
  }
  return payload.access_token;
}

function tokenLooksInvalid(token) {
  if (!token) return true;
  if (token.includes('paste') || token.includes('...')) return true;
  if (token === 'your-token' || token === 'paste_token_here') return true;
  return token.length < 20;
}

/** @param {string} store @param {string} token @param {string} query @param {Record<string, unknown>} [variables] @param {boolean} [retry] */
async function gqlWithToken(store, token, query, variables, retry = true) {
  const res = await fetch(`https://${store}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables: variables ?? undefined }),
  });
  const text = await res.text();
  if (res.status === 401 && retry) {
    const fresh = await refreshAdminTokenFromClientCredentials();
    if (fresh) return gqlWithToken(store, fresh, query, variables, false);
  }
  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}: ${text.slice(0, 500)}`);
  }
  const payload = JSON.parse(text);
  if (payload.errors?.length) {
    const msgs = payload.errors.map((e) => e.message).join('; ');
    throw new Error(`GraphQL errors: ${msgs}`);
  }
  return payload.data;
}

/** @param {string} store @param {string} query @param {Record<string, unknown>} [variables] @param {boolean} [mutate] */
function gqlWithCli(store, query, variables, mutate = false) {
  const args = ['store', 'execute', '-s', store, '--json', '--query', query];
  if (mutate) args.push('--allow-mutations');
  if (variables) args.push('--variables', JSON.stringify(variables));
  const out = execFileSync('shopify', args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const jsonStart = out.indexOf('{');
  if (jsonStart === -1) throw new Error(`No JSON in CLI output:\n${out}`);
  const data = JSON.parse(out.slice(jsonStart));
  const errKey = Object.keys(data).find((k) => data[k]?.userErrors?.length);
  if (errKey && data[errKey].userErrors.length) {
    const msgs = data[errKey].userErrors.map((e) => e.message).join('; ');
    throw new Error(`${errKey}: ${msgs}`);
  }
  return data;
}

/**
 * @param {object} opts
 * @param {string} opts.store
 * @param {string} opts.query
 * @param {Record<string, unknown>} [opts.variables]
 * @param {boolean} [opts.mutate]
 */
function assertNoUserErrors(data) {
  const errKey = Object.keys(data).find((k) => data[k]?.userErrors?.length);
  if (errKey && data[errKey].userErrors.length) {
    const msgs = data[errKey].userErrors.map((e) => e.message).join('; ');
    throw new Error(`${errKey}: ${msgs}`);
  }
  return data;
}

export async function adminGql({ store, query, variables, mutate = false }) {
  let token = getAdminToken();
  if (tokenLooksInvalid(token)) {
    await refreshAdminTokenFromClientCredentials();
    token = getAdminToken();
  }
  if (!tokenLooksInvalid(token)) {
    return assertNoUserErrors(await gqlWithToken(store, token, query, variables));
  }
  return assertNoUserErrors(gqlWithCli(store, query, variables, mutate));
}

export function adminAuthMode() {
  return tokenLooksInvalid(getAdminToken()) ? 'cli-session' : 'token';
}
