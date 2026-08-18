# NanoParse MCP

**Give your AI agent clean, structured web content.** NanoParse MCP is a hosted Model Context Protocol server at `https://nanoparse.app/mcp` that turns any URL into clean Markdown your agent can actually use — with machine-readable trust signals attached.

No install. No wallet key. No `.env`. Connect once and your agent can read the web.

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

## Payments

- **First 10 parses per device are free.** No account, no API key, no human required.
- **After that: $0.0175 per parse** (flat, no subscriptions) via **x402** — an open micropayment protocol. Your agent's wallet signs the payment automatically. To give your agent a Coinbase wallet, run `npx @coinbase/payments-mcp` and connect it alongside NanoParse.
- **Prefer a card?** Buy a prepaid credit pack at [nanoparse.app/payments](https://nanoparse.app/payments) and send your bearer key with requests:
  `Authorization: Bearer <your np_bal_ key>`

## How payments work under the hood

When an agent without free quota calls `nanoparse_fetch`, the endpoint responds with an **HTTP 402 — Payment Required** carrying x402 payment instructions. The agent's wallet signs a $0.0175 USDC (Base) transfer, the facilitator settles it, and the parse proceeds. The hosted endpoint handles the entire challenge → settlement flow — the agent never needs a private key on your machine.

## Example

```
You: Fetch https://www.ft.com/content/... and summarize the argument.

Agent: [calls nanoparse_fetch(url)]
       → clean Markdown + Litmus signals
       → summarizes from primary content, cites freshness and authority
```

## Repository note

The `nanoparse-mcp` npm package previously published here was the first-generation local client, which held a wallet private key and signed x402 payments on your machine. It is retired: the hosted MCP endpoint now handles the full payment flow itself, so the local client is no longer needed. **Use the hosted endpoint above** — it is the current, supported integration.

## Docs

- Integration guide: [nanoparse.app/integration](https://nanoparse.app/integration)
- Pricing: [nanoparse.app/payments](https://nanoparse.app/payments)
- API + MCP endpoint: [nanoparse.app](https://nanoparse.app)

MIT licensed.
