# NanoParse MCP

[![npm version](https://img.shields.io/npm/v/nanoparse-mcp)](https://www.npmjs.com/package/nanoparse-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

MCP client for [NanoParse](https://nanoparse.app) — pay-per-parse web content extraction for AI agents. No accounts, no API keys. Just paste a URL and get clean, structured Markdown back.

## What this is

A thin MCP (Model Context Protocol) client that lets AI agents call NanoParse's hosted API. The client handles:

- MCP tool registration (`nanoparse_fetch`)
- HTTP calls to `nanoparse.app/fetch`
- x402 micropayment signing (USDC on Base)

The browser rendering, content scoring, and Markdown conversion stay on NanoParse's infrastructure — this repo is the client layer only.

## Install

```bash
npx nanoparse-mcp
```

Or install globally:

```bash
npm install -g nanoparse-mcp
```

### Prerequisites

- Node.js 18+
- A Base wallet with USDC (after your first 50 free parses)
- Set `NANOPARSE_WALLET_KEY` in your environment

## Getting a wallet

If you don't already have a Base-compatible wallet for your agent, don't generate one by hand — use [NanoParse/agent-wallet-prompt](https://github.com/NanoParse/agent-wallet-prompt), a copy-paste prompt that walks your coding assistant through generating one safely with an audited library. Come back here once it's funded.

## Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Base wallet private key:

   ```
   NANOPARSE_WALLET_KEY=0x_your_private_key_here
   ```

3. Add to your MCP client config:

   ```json
   {
     "mcpServers": {
       "nanoparse": {
         "command": "npx",
         "args": ["nanoparse-mcp"]
       }
     }
   }
   ```

Your agent will auto-discover the `nanoparse_fetch` tool.

## Usage

Your agent calls `nanoparse_fetch` with a URL:

```
nanoparse_fetch("https://example.com/article")
```

Optional debug mode:

```
nanoparse_fetch("https://example.com/article", debug=true)
```

See [`examples/basic-usage.md`](./examples/basic-usage.md) for a full copy-paste runnable example.

### Pricing

First 50 calls per IP are free. After that, **$0.0175 per parse** via x402 micropayment in USDC on Base. See [nanoparse.app](https://nanoparse.app) for current pricing and API docs.

## Security

- Your private key is read from `NANOPARSE_WALLET_KEY` at runtime and is **never logged, printed, or transmitted** except for signing x402 payment requests.
- The `.env` file is excluded from git via `.gitignore`.
- Payment signing uses [viem](https://viem.sh), an established, audited Ethereum library.
- This client never constructs raw blockchain transactions — payment settlement is handled by the [x402 facilitator](https://x402.org).

## Versioning

This project follows [Semantic Versioning](https://semver.org). See [`CHANGELOG.md`](./CHANGELOG.md) for release history.

## License

MIT — see [LICENSE](./LICENSE).
