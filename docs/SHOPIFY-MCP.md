# Shopify AI Toolkit (Cursor MCP)

Option A for lurafi development: **documentation and schema validation only** — no live store writes.

## Install

### Marketplace (recommended)

1. Open [cursor.com/marketplace/shopify](https://cursor.com/marketplace/shopify).
2. Install the Shopify plugin (one click, auto-updates).

### Manual (repo config)

`.cursor/mcp.json` is already configured for `@shopify/dev-mcp`. Reload MCP after clone:

**Cursor Settings → MCP → shopify-dev-mcp**

Requires **Node 18+**. No API key for docs/schema tools.

## Verify

In Cursor chat, ask:

> What's the correct GraphQL mutation to create a product variant?

If the agent uses Shopify docs/search tools and returns an up-to-date Admin API mutation, MCP is working.

## Telemetry

Shopify may receive the code under validation (GraphQL queries, Liquid templates), not just pass/fail. This repo sets:

```json
"OPT_OUT_INSTRUMENTATION": "true"
```

Keep that enabled for client or proprietary theme work.

## Store changes (separate from MCP)

Theme push, products, and locales on **mitipi-2** use `.env` + `scripts/` — see `AGENTS.md` and `docs/FIX-LURAFI-APP-AND-PRODUCTS.md`.
