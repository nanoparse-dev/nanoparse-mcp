# Changelog

All notable changes to nanoparse-mcp will be documented in this file.

---

## [2.0.0] - 2026-08-28

### Changed

- Repo restructured as the public home for the **hosted** MCP endpoint
  (`https://nanoparse.app/mcp`): docs + real examples, no client code.
- Retired v1 local stdio client moved to `archive/v1-local-client/`
  (was `src/`), with a DEPRECATED banner. The client held a wallet private
  key locally (`NANOPARSE_WALLET_KEY`) and is replaced by the hosted
  endpoint's own payment flow.
- npm package `nanoparse-mcp` deprecated — use the hosted endpoint.
- README: real Litmus output example (arXiv parse), worked agent
  conversation, cost comparison vs Firecrawl (verified Aug 2026), new
  `examples/` directory (`example-output.json`, `agent-conversation.md`,
  `costs.md`).

## [1.0.9] - 2026-08-23

### Changed

- Price: $0.0175 → **$0.01** per parse (tool descriptions + README)
- README: removed dead card-pack section (`/payments` not live); docs links now point to live pages (`/quickstart`, `/compare`)
- Server version string synced with package version

## [1.0.8] - 2026-08-23

### Changed

- Price: $0.0175 → **$0.01** per parse in `nanoparse_fetch` tool description

## [1.0.7] - 2026-08-17

### Changed

- Local stdio client retired — hosted MCP endpoint (`https://nanoparse.app/mcp`) is the only supported integration
- README rewritten as customer guide to the hosted MCP

## [1.0.2] - 2026-08-02

### Fixed

- Added missing `#!/usr/bin/env node` shebang to `dist/index.js`. Plain `npx nanoparse-mcp` now works without requiring `node dist/index.js`. Added `postbuild` script to prepend shebang after `tsc` compilation and set execute permissions.

## [1.0.1] - 2026-08-01

### Changed

- Updated `nanoparse_fetch` tool description

## [1.0.0] - 2026-07-26 — Initial release

- MCP server with stdio transport, single tool: `nanoparse_fetch(url, debug?)`
- x402 payment signing via viem (wallet key from `NANOPARSE_WALLET_KEY` env var)
- Thin client only — browser rendering and content scoring run on NanoParse's infrastructure
