# Changelog

All notable changes to nanoparse-mcp will be documented in this file.

---

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
