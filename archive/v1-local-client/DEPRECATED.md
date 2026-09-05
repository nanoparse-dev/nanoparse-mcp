# DEPRECATED — v1 local stdio client (retired)

**Do not use this code.** It is preserved for history only.

This was the first-generation `nanoparse-mcp` integration (v1.0.0–1.0.9):

- A local stdio MCP server that signed x402 payments **on your machine**
  using a wallet private key from the `NANOPARSE_WALLET_KEY` environment
  variable (`payment.ts`).
- Retired in favor of the **hosted endpoint** at `https://nanoparse.app/mcp`,
  which handles the entire payment flow itself — no local key, no local
  client, one config block in your MCP client.

The npm package `nanoparse-mcp` is deprecated. Use:

```json
{
  "mcpServers": {
    "nanoparse": {
      "url": "https://nanoparse.app/mcp"
    }
  }
}
```

Why it was retired: holding a wallet private key in a local process was the
wrong architecture. The hosted endpoint signs nothing on your machine, your
key never leaves your wallet, and setup is one URL instead of a key
handling flow.

Retired 2026-08-23 (1.0.7). See the repo root `README.md` for the current
integration.

Current pricing & free tier: [nanoparse.app/compare](https://nanoparse.app/compare).
Pricing figures quoted in this archived client are historical — the hosted
endpoint and the repo root README are the source of truth.
