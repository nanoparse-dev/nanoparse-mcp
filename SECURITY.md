# Security policy

NanoParse is a hosted web-to-Markdown API and MCP server. This repository holds the public
documentation, examples and client manifests for it — the service code itself is private.

## Supported surfaces

| Surface | Address | Notes |
|---|---|---|
| MCP server | `https://nanoparse.app/mcp` | Streamable HTTP. The supported integration. |
| HTTP API | `POST https://nanoparse.app/fetch` | Paid per successful parse via x402 (USDC on Base). |
| This repository | `nanoparse-dev/nanoparse-mcp` | Docs, examples, plugin manifests only. |

The npm package `nanoparse-mcp` 1.0.x is **retired** and unsupported (every 1.0.x version is
flagged deprecated on npm). Use the hosted endpoint above.

## Reporting a vulnerability

Email **hello@nanoparse.app** — the same address published at
`https://nanoparse.app/.well-known/security.txt`.

Include:

- what the issue is, and which address it is on (`/mcp`, `/fetch`, or a site page);
- the smallest reproducible request — a `curl` transcript or a tool call is ideal;
- what an attacker gains, and any preconditions.

Reports worth sending include payment-verification bypass (spending without settling),
free-quota bypass, cross-request data leakage, injection through a fetched page, and anything
that lets one caller affect another caller's traffic or funds.

Please do not: run denial-of-service or load tests, scan in a way that degrades the service,
attempt to move funds that are not yours, or test against data you do not control.

## What to expect

- Every report is read by a human at `hello@nanoparse.app`; expect a first reply within a few
  business days.
- There is **no bug bounty** — no payment is offered for reports.
- Please allow a reasonable window to investigate and ship a fix before disclosing publicly.
  Credit is given in the fix note if that is wanted.

Reports submitted in good faith, staying inside the rules above, are welcome.

## Not in scope

- Vulnerabilities in third-party dependencies or in the x402 / MCP protocol specifications —
  report those upstream.
- Anything already fixed, or reproducible only by a client that ignores the published API
  contract.
- Requests for service features, pricing or quota changes (use the contact address on
  `https://nanoparse.app`).
