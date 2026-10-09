# NanoParse MCP

[![npm version](https://img.shields.io/npm/v/nanoparse-mcp)](https://www.npmjs.com/package/nanoparse-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Website](https://img.shields.io/badge/web-nanoparse.app-22D3EE)](https://nanoparse.app)
[![MCP Score](https://checkmcp.dev/badge/nanoparse-app.svg?url=https%3A%2F%2Fnanoparse.app%2Fmcp)](https://checkmcp.dev/mcp/nanoparse-app)

**The easiest way for AI agents to read the web.** NanoParse MCP is a hosted Model Context Protocol server at `https://nanoparse.app/mcp` that turns any URL into clean Markdown your agent can actually use — with machine-readable trust signals attached.

No install. No wallet key. No `.env`. Connect once and your agent can read the web.

**Why agents choose NanoParse over Firecrawl or Jina Reader:** every page comes back with **Litmus** — 15 machine-readable signals that tell your agent *whether to trust and cite the page* before it reads a word. Pay $0.005 per parse via x402 once the free tier runs out. Full JavaScript/SPA rendering, native GFM tables. No account, no subscription, no API key.

## Quick start

Add this to your MCP client config:

```json
{
  "mcpServers": {
    "nanoparse": {
      "url": "https://nanoparse.app/mcp"
    }
  }
}
```

Restart your client, and your agent auto-discovers two tools:

- **`nanoparse_fetch(url)`** — fetch any web page and get clean Markdown back
- **`nanoparse_status()`** — check free quota, wallet and USDC balance before spending

That's it. Your agent can now fetch pages from inside any MCP-compatible client (Claude, Cursor, Hermes, Windsurf, and others).

## What you get

`nanoparse_fetch` renders the page in a real headless browser (JavaScript and all), isolates the actual article from nav, ads, and cookie banners, and returns:

- **Clean Markdown** — GFM tables, callouts, math, and footnotes preserved
- **Metadata** — title, author, dates, language, word count, OpenGraph, schema.org JSON-LD
- **Litmus** — machine-readable signals your agent can reason over: source authority, freshness, structural trust, content density, syndication and paywall detection

`nanoparse_status` tells your agent exactly where it stands: free parses remaining, wallet and USDC balance, and whether the next call will succeed without payment. Agents call it before spending.

## Real output

Every parse returns `markdown` + `metadata` + `litmus`. Here is the full `litmus` object from a real parse of an arXiv paper (`examples/example-output.json` — markdown truncated there, litmus complete and unmodified):

```json
{
  "litmus": {
    "source": { "type": "academic", "authority": 0.85, "rationale": "academic source" },
    "freshness": { "published": null, "age": "unknown", "stale_warning": "No publish date found — verify independently", "modified": null, "has_correction": false, "correction_note": null },
    "tldr": "Abstract page for arXiv paper 2401.14295: Demystifying Chains, Trees, and Graphs of Thoughts",
    "key_figures": [ { "value": "2,247", "context": "Thu, 25 Jan 2024 16:34:00 UTC (2,247 KB)" } ],
    "structural_trust_score": { "level": "medium", "trust_factors": ["High-authority source", "No publish date found — verify independently"] },
    "hedge_language": { "density": "low", "markers_found": 0, "per_500_words": 0 },
    "content_density": { "thin_content": false, "substantive_sentence_ratio": 0.76 },
    "syndication": { "detected": false, "note": null },
    "paywall": { "detected": false, "note": null },
    "content_type": "academic_paper",
    "reading_time": { "minutes": 4 },
    "is_archived": { "archive_org": true, "archive_is": false },
    "outbound_authority": { "score": 0.54, "top_domains": ["ui.adsabs.harvard.edu", "scholar.google.com"] },
    "boilerplate_ratio": { "ratio": 0.08, "confidence": "high" }
  }
}
```

The agent learns *before reading a word*: this is an academic source (0.85 authority), structural trust is **medium** — high authority, but no publish date found, so verify independently. It also gets the one-sentence summary, the key numbers, and confirmation there's no paywall or syndication flag. See [`examples/agent-conversation.md`](examples/agent-conversation.md) for a full worked round-trip.

## Payments

- **First 10 parses per network (subnet) are free** — lifetime, shared across your whole network. No account, no API key, no human required.
- **After that: $0.005 per parse** (flat, no subscriptions) via **x402** — an open micropayment protocol. Your agent's wallet signs the payment automatically. To give your agent a Coinbase wallet, run `npx @coinbase/payments-mcp` and connect it alongside NanoParse.

Copy-paste recipe for both paths — the wallet-MCP one with no code, and a ~40-line REST client — including the exact `402 → sign → retry` loop and the error codes worth branching on: [`examples/pay-with-x402.md`](examples/pay-with-x402.md).

## How payments work under the hood

When an agent without free quota calls `nanoparse_fetch`, the endpoint responds with an **HTTP 402 — Payment Required** carrying x402 payment instructions. The agent's wallet signs a $0.005 USDC (Base) transfer, the facilitator settles it, and the parse proceeds. The hosted endpoint handles the entire challenge → settlement flow — the agent never needs a private key on your machine.

## Pricing vs Firecrawl

| | NanoParse | Firecrawl Hobby |
|---|---|---|
| Billing | **$0.005 per parse, flat** | $16/mo subscription, credits expire monthly |
| 5,000 parses | **$25.00** | $16 base — but ~$145 with JSON/extraction modes (9× credit burn) |
| Account / API key | **None** | Required |
| Agent can pay directly (x402) | **Yes** | No |

Full math, including when Firecrawl's base rate wins at scale: [`examples/costs.md`](examples/costs.md).

## Example

```
You: Fetch https://arxiv.org/abs/2401.14295 and summarize the argument.

Agent: [calls nanoparse_fetch(url)]
       → clean Markdown + Litmus (academic, authority 0.85, 4-min read,
         no date found — verify, no paywall)
       → summarizes from primary content, cites authority and freshness
```

## Repository note

The `nanoparse-mcp` npm package and the local stdio client were the
first-generation integration, which held a wallet private key
(`NANOPARSE_WALLET_KEY`) and signed x402 payments on your machine. Both are
**retired**: the hosted endpoint above now handles the full payment flow
itself, so no local client or wallet key is needed. The retired client code
is preserved in [`archive/v1-local-client/`](archive/v1-local-client/) for
history, and the npm package is deprecated. **Use the hosted endpoint** — it
is the current, supported integration.

## Docs

- Quick start & integration: [nanoparse.app/quickstart](https://nanoparse.app/quickstart)
- Compare & pricing: [nanoparse.app/compare](https://nanoparse.app/compare)
- API + MCP endpoint: [nanoparse.app](https://nanoparse.app)

MIT licensed.
