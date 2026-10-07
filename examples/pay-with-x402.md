# Paying for a parse with x402

NanoParse answers an unauthenticated call with **HTTP 402** and machine-readable
terms — the price, the token, the chain, the recipient, and what a valid signature
must look like. No account, no API key, no card, no subscription.

- **First 10 parses per network (subnet): free**, lifetime.
- **After that: $0.005 USDC on Base per parse**, flat.
- Settlement runs **after** a page is read. A page that cannot be read — bot wall,
  consent wall, paywall, JS shell with no text — is reported with a named reason
  and **never charged**.

Every parse returns clean Markdown plus **Litmus** — 15 machine-readable signals
(source authority, freshness, structural trust, content density, syndication,
paywall state) in the same response, not as a second billed call.

Two ways to pay. Pick one.

---

## Option A — give the agent a wallet, write no code

Add NanoParse to your MCP client, and give the agent a wallet that can sign:

```json
{
  "mcpServers": {
    "nanoparse": {
      "url": "https://nanoparse.app/mcp"
    }
  }
}
```

```
npx @coinbase/payments-mcp
```

(The Coinbase agentic wallet MCP — self-custody, funded via Apple Pay. Docs:
<https://docs.cdp.coinbase.com/agentic-wallet/mcp/welcome>.)

Then the loop is two calls:

1. `nanoparse_fetch(url)`. Once the free tier is spent, the tool returns an
   `isError` result whose **`structuredContent` is the PaymentRequired object** —
   `x402Version`, `accepts[]`, `extensions`. It is the quote, not a failure.
2. Sign `accepts[0]` and retry the same tool with
   `payment_signature` = the base64url JSON envelope. This argument works in
   **every** MCP client; there are no custom headers to set. A client that can
   set headers may instead send the same payload as `Payment-Signature`, or put
   the envelope object in `_meta["x402/payment"]`.

`nanoparse_status(address)` is free and tells the agent what it needs to know
before spending: free parses remaining, wallet and USDC balance, whether the next
call will go through without payment.

---

## Option B — a REST client that pays its own way

~40 lines of Node with [`viem`](https://viem.sh). No SDK, no server-side key:
the wallet is the caller's.

```js
// read-page.mjs — read one page, paying $0.005 in USDC on Base only if asked.
// Usage:  npm i viem && WALLET_KEY=0x... node read-page.mjs https://example.com
//
// 1. Try the free tier (10 parses per network, lifetime): a plain POST.
// 2. A 402 is the quote, not an error. Read the terms out of it.
// 3. Sign an EIP-3009 permit over those terms (gas is the facilitator's).
// 4. Retry with the signed envelope; poll /status (free) until the page lands.
import { privateKeyToAccount } from "viem/accounts";

const ENDPOINT = "https://nanoparse.app/fetch";
const account = privateKeyToAccount(process.env.WALLET_KEY);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64");

async function readPage(url) {
  const post = (headers) =>
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ url }),
    });

  // 1. Free tier first — no payment, no key, no account.
  let res = await post();
  if (res.status !== 402) {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return poll(await res.json());
  }

  // 2. The terms. `amount` is micro-USDC ("5000" = $0.005) and `payTo` is the
  //    only address a permit should ever be signed for.
  const terms = (await res.json()).payment_required.accepts[0];
  const now = Math.floor(Date.now() / 1000);
  const nonce = "0x" + Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("hex");
  const authorization = {
    from: account.address,
    to: terms.payTo,
    value: terms.amount,
    validAfter: String(now - 5),
    validBefore: String(now + 895), // within maxTimeoutSeconds from the challenge
    nonce,
  };

  // 3. EIP-3009 transferWithAuthorization. The EIP-712 domain belongs to the
  //    token contract, so take it from the challenge: extra.name is the domain
  //    name "USD Coin" — signing against the ticker "USDC" fails verification.
  const signature = await account.signTypedData({
    domain: {
      name: terms.extra.name,
      version: terms.extra.version,
      chainId: 8453, // Base
      verifyingContract: terms.asset,
    },
    types: {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    },
    primaryType: "TransferWithAuthorization",
    message: {
      ...authorization,
      value: BigInt(authorization.value),
      validAfter: BigInt(authorization.validAfter),
      validBefore: BigInt(authorization.validBefore),
    },
  });

  // 4. Retry with the envelope the challenge quoted: accepted[] echoed verbatim.
  res = await post({
    "Payment-Signature": b64({ x402Version: 2, accepted: terms, payload: { signature, authorization } }),
  });
  const job = await res.json();
  if (!res.ok) throw new Error(`${job.error_code}: ${job.message}`);
  return poll(job); // 202 { jobId, statusUrl }
}

// /status is free and unauthenticated: watch a job without spending anything.
async function poll(job) {
  for (;;) {
    const out = await (await fetch(job.statusUrl)).json();
    if (out.status === "completed") return out; // { markdown, metadata, litmus }
    if (out.status !== "processing") throw new Error(`${out.status}: ${out.error_code ?? ""}`);
    await new Promise((r) => setTimeout(r, 2000));
  }
}

console.log((await readPage(process.argv[2])).markdown);
```

---

## The 402 is the quote

Captured live, free tier exhausted, no payment attached:

```json
{
  "error": "payment_required",
  "error_code": "free_tier_exhausted",
  "free_calls_used": 10,
  "free_calls_limit": 10,
  "payment_required": {
    "x402Version": 2,
    "accepts": [
      {
        "scheme": "exact",
        "network": "eip155:8453",
        "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "amount": "5000",
        "payTo": "0x57a1d06873db575baeae1f6af30862a75c7bd570",
        "maxTimeoutSeconds": 60,
        "extra": { "assetTransferMethod": "eip3009", "name": "USD Coin", "version": "2" }
      }
    ]
  }
}
```

The same terms travel base64url-encoded in the `payment-required` response header,
and the recipient is repeated as a CAIP-style `pay-to: ethereum:base:0x…` header.
`access-control-allow-origin: *` and the `Content-Type, Payment-Signature,
Authorization` request headers are allowed on this route, so a browser-side agent
can send a signed payment too.

Four fields carry the weight:

- **`amount`** is micro-USDC — `"5000"` is $0.005 at six decimals. There is no
  currency string to parse.
- **`network`** is a CAIP-2 chain id (`eip155:8453` is Base) and **`asset`** is the
  USDC contract on it, so the client never guesses which USDC.
- **`extra.name` / `extra.version`** are the EIP-712 domain of the token contract:
  `"USD Coin"` v2. Signing against `"USDC"` produces a signature that fails
  verification — the domain is part of the digest.
- **`payTo`** is the only address a permit should ever be signed for. A payload
  pointing anywhere else is rejected before any signature is checked.

## What the server checks before the facilitator is called

A wrong shape costs nothing — it answers `400 invalid_payment_payload`:

- `x402Version` is exactly `2`.
- `accepted` repeats the terms verbatim: `scheme`, `network`, `asset`, `amount`,
  `payTo`.
- `payload.signature` is `0x` + 130 hex characters (65-byte packed `r‖s‖v`).
- `payload.authorization.value` equals `amount` exactly.
- `payload.authorization.nonce` is `0x` + 64 hex characters, and single-use
  on-chain — which is what makes "retry the same payload" safe rather than hopeful.
- `validAfter` is in the past and `validBefore` in the future.

## Retry policy, as error codes

| `error_code` | What to do |
|---|---|
| `insufficient_usdc` | Fund the wallet and sign a **fresh** envelope. |
| `invalid_payment_payload`, `invalid_payment` | The shape or signature is wrong. Fix it; retrying unchanged cannot succeed. |
| `permit_expired`, `permit_not_yet_valid` | Sign a fresh permit. |
| `settlement_failed` | Ambiguous settle. Retry with the **same** envelope — it is idempotent. |
| `screening_declined` | Compliance screening declined. Do not retry. |
| `location_blocked` | A jurisdiction the facilitator does not serve. |
| `self_send_not_allowed` | Payer and recipient are the same address. |
| `content_insufficient` | The page rendered but yielded almost no text (JS shell, login wall). **Not charged.** |
| `domain_blocked` | The host repeatedly returned nothing parseable. **Not charged.** Do not retry. |

There is no refund path because nothing is charged up front: settlement runs after
a successful read, so a failed render simply never settles.

## Check the recipient before you sign

`/.well-known/x402` publishes the address the endpoint claims, and the 402 repeats
it. Compare them before signing anything:

```js
const accept = terms; // accepts[0] from the 402
const disc = await (await fetch("https://nanoparse.app/.well-known/x402")).json();
if (!disc.ownershipProofs.map((a) => a.toLowerCase()).includes(accept.payTo.toLowerCase()))
  throw new Error("recipient not published by the endpoint");
```

That buys consistency, not identity — both documents come from the same origin —
but it is one GET and it catches a swapped recipient.

## What was verified

- The client under **Option B** was run verbatim against the live endpoint on
  2026-10-06 with a fresh, unfunded throwaway wallet: free tier exhausted → `402`
  → signed envelope → retry → `insufficient_usdc: Payer's USDC balance is too low
  for this call (needs 5000 micro-USDC on Base)`. The shape and signature were
  accepted; nothing was charged.
- The **Option A** MCP loop was verified the same way: `tools/call` returned
  `isError: true` with `structuredContent` = the PaymentRequired object, and the
  retry carrying `payment_signature` answered
  `-32000 / insufficient_usdc` for the unfunded payer.
- The settle leg — USDC actually moving to the treasury on Base — is exercised
  end to end by our own labeled canary through this same paid path.

## Docs

- Quick start: <https://nanoparse.app/quickstart>
- Machine spec: <https://nanoparse.app/openapi.json>
- Agent-facing description: <https://nanoparse.app/llms.txt>
- x402 discovery: <https://nanoparse.app/.well-known/x402>

MIT licensed.
