# Basic Usage — NanoParse MCP

A minimal end-to-end example showing an AI agent calling `nanoparse_fetch`
on a real URL and receiving clean Markdown back.

**Prerequisites:** Funded Base wallet with USDC (see
[NanoParse/agent-wallet-prompt](https://github.com/NanoParse/agent-wallet-prompt)),
`NANOPARSE_WALLET_KEY` set in your environment.

---

### 1. Install and configure

```bash
npm install -g nanoparse-mcp
cp .env.example .env
# Edit .env with your Base wallet private key
```

### 2. Add to your MCP client config

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

### 3. Agent calls nanoparse_fetch

Your agent now discovers `nanoparse_fetch` as a native tool. Example call:

```
nanoparse_fetch("https://en.wikipedia.org/wiki/Base_(blockchain)")
```

### 4. Expected response

```json
{
  "success": true,
  "url": "https://en.wikipedia.org/wiki/Base_(blockchain)",
  "markdown": "# Base (blockchain)\n\nBase is a Layer 2...",
  "metadata": {
    "title": "Base (blockchain) - Wikipedia",
    "description": "Base is a Layer 2 scaling solution...",
    "site": "Wikipedia",
    "domain": "en.wikipedia.org",
    "wordCount": 2340,
    "language": "en"
  }
}
```

### 5. With debug mode

```
nanoparse_fetch("https://en.wikipedia.org/wiki/Base_(blockchain)", debug=true)
```

Debug response includes extraction diagnostics:

```json
{
  "success": true,
  "url": "...",
  "markdown": "...",
  "metadata": { "...": "..." },
  "debug": {
    "contentSelector": "auto-detected",
    "metadataSource": "opengraph + schema.org",
    "cleaning": { "blocksRemoved": 12, "blocksKept": 34 },
    "timing": { "metadataFetchMs": 180, "browserRenderMs": 2400 }
  }
}
```

### Pricing after free tier

First 50 calls per IP are free. After that, **$0.0175/parse** in USDC on Base,
paid automatically via x402. Your wallet signs the payment — no accounts,
no API keys.
