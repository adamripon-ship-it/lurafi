/**
 * Batch-translate flat locale strings via Anthropic Claude.
 * Used by scripts/translate-locales.mjs (--provider=claude).
 */
import { loadLanguagesConfig } from './i18n/registry.mjs';

const glossary = loadLanguagesConfig().glossary || [];
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

function protectGlossary(text) {
  let out = text;
  const placeholders = [];
  glossary.forEach((term, i) => {
    const ph = `__GLOSS${i}__`;
    if (out.includes(term)) {
      placeholders.push({ ph, term });
      out = out.split(term).join(ph);
    }
  });
  return { text: out, placeholders };
}

function restoreGlossary(text, placeholders) {
  let out = text;
  for (const { ph, term } of placeholders) {
    out = out.split(ph).join(term);
  }
  return out;
}

function extractJsonObject(raw) {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1].trim() : trimmed;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in Claude response');
  return JSON.parse(body.slice(start, end + 1));
}

/**
 * @param {Record<string, string>} keyTexts
 * @param {{ code: string, nativeName: string }} locale
 * @param {string} apiKey
 */
export async function translateClaudeBatch(keyTexts, locale, apiKey) {
  const protectedEntries = Object.entries(keyTexts).map(([key, text]) => {
    const { text: protectedText, placeholders } = protectGlossary(text);
    return { key, protectedText, placeholders };
  });

  const payload = Object.fromEntries(
    protectedEntries.map((e) => [e.key, e.protectedText]),
  );

  const system = `You are a senior native ${locale.nativeName} copywriter for Lurafi (lurafi.ai), a premium Swiss brand selling Kevin — an AI home presence simulator.

Translate English UI strings into natural, fluent ${locale.nativeName} for a consumer website. Tone: clear, confident, Apple-like simplicity — not word-for-word.

Rules:
- Keep brand terms exactly as in English: ${glossary.join(', ')}
- Preserve Liquid placeholders exactly: {{ shop.name }}, {{ count }}, {{ year }}, etc.
- Preserve HTML if present
- For pipe-separated lists (|), translate each segment; keep the | separators
- Return ONLY a valid JSON object with the same keys as input
- Do not add or remove keys`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      temperature: 0.25,
      system,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(payload, null, 2),
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.content?.find((b) => b.type === 'text')?.text;
  if (!text) throw new Error('Empty Claude response');

  const parsed = extractJsonObject(text);
  const out = {};
  for (const { key, placeholders } of protectedEntries) {
    const raw = parsed[key];
    if (typeof raw !== 'string') {
      throw new Error(`Missing translation for key: ${key}`);
    }
    out[key] = restoreGlossary(raw, placeholders);
  }
  return out;
}
