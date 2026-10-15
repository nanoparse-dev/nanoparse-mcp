# NanoParse — Agent Plugin

An [Agent Plugins](https://agent-plugins.org/) v1.0.0 package that adds NanoParse to any
compatible agent client (VS Code, Cursor, GitHub Copilot, ChatGPT & Codex, Kiro, Hermes,
and others). One folder — a manifest, an MCP config, and a skill.

## What it does

NanoParse reads any live web page into **clean Markdown** with **Litmus** — 15
machine-readable trust signals (source authority, freshness, structural trust,
syndication, paywall detection). The agent learns whether a source is worth citing
*before* it reads a word.

## Contents

```
plugin/
├── plugin.json              # Agent Plugins v1.0.0 manifest
├── mcp.json                 # the NanoParse MCP server (streamable HTTP)
├── skills/nanoparse/SKILL.md # teaches the agent when and how to use NanoParse
└── LICENSE                  # MIT
```

## Install

Point your client at this directory (or the repo). The plugin registers one MCP server:

- `nanoparse` → `https://nanoparse.app/mcp` (streamable HTTP)

The agent auto-discovers two tools:

- **`nanoparse_fetch(url)`** — read one URL into clean Markdown + metadata + Litmus.
- **`nanoparse_status(address)`** — free quota, wallet and USDC balance for a `0x…` address.

No install, no `.env`, no API key. Connect once and the agent can read the web.

## Pricing (honest version)

- **Free:** 10 free parses per month with a signed wallet, or 3 anonymous free tries
  per network (subnet).
- **Paid:** **$0.005 per parse**, flat, via **x402** (USDC on Base). No account, no
  subscription, no API key — payment *is* the only authentication.
- A page NanoParse cannot read (bot wall, consent wall, paywall, PDF) is **never charged** —
  settlement happens only after a successful render.

**Which clients can actually pay:** the x402 model is wallet-native, so it works for
coding agents that can hold a funded wallet (Cursor, Codex, Copilot, VS Code, Kiro,
Hermes — run `npx @coinbase/payments-mcp` alongside, or pass a `payment_signature`
directly). A client with no wallet can use the free tier and then stops at the payment
wall — there is no card fallback. See
[`examples/pay-with-x402.md`](../examples/pay-with-x402.md) for the full
`402 → sign → retry` loop and the error codes worth branching on.

## Docs

- Agent-facing quick start: [nanoparse.app/quickstart](https://nanoparse.app/quickstart)
- Pricing & comparison: [nanoparse.app/compare](https://nanoparse.app/compare)
- MCP server card: [nanoparse.app/.well-known/mcp/server-card.json](https://nanoparse.app/.well-known/mcp/server-card.json)

MIT licensed.
