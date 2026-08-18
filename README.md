# NanoParse MCP — Retired

**This package is retired.** The recommended integration is NanoParse's hosted MCP endpoint — no install, no wallet key, no `.env` file.

## Current integration

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

Your agent auto-discovers `nanoparse_fetch(url)` (optional `debug: true`) and `nanoparse_status()`.

**Payments:** the first 10 parses per device are free. After that, $0.0175 per parse via x402 — your agent's wallet signs the payment; run `npx @coinbase/payments-mcp` to give it a Coinbase wallet. Card prepaid packs are also supported: send `Authorization: Bearer <your np_bal_ key>` with each request.

## Why this package was retired

The npx client existed to hold a wallet private key and sign x402 payments locally. The hosted MCP endpoint handles the full payment flow itself (x402 challenge → settlement), and agents hold their own wallets — so the local client added an install step and a secret to manage, for no benefit.

Docs: https://nanoparse.app/integration · Pricing: https://nanoparse.app/payments

MIT licensed. Archived for reference.
