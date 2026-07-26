import { signPayment } from "./payment.js";

const FETCH_ENDPOINT = "https://nanoparse.app/fetch";

interface X402PaymentTerms {
  error: "payment_required";
  scheme: "exact";
  network: string;
  asset: string;
  amount: string;
  payTo: string;
  free_calls_used: number;
  free_calls_limit: number;
}

interface NanoParseResponse {
  success: boolean;
  url: string;
  markdown: string;
  metadata: {
    title?: string;
    author?: string;
    description?: string;
    published?: string;
    image?: string;
    favicon?: string;
    site?: string;
    domain?: string;
    wordCount?: number;
    language?: string;
  };
  schemaOrgData?: Record<string, unknown>;
  freeCallsRemaining?: number;
  debug?: {
    contentSelector?: string;
    metadataSource?: string;
    cleaning?: { blocksRemoved: number; blocksKept: number };
    timing?: { metadataFetchMs: number; browserRenderMs: number };
  };
}

export async function fetchPage(
  url: string,
  debug = false
): Promise<NanoParseResponse> {
  const body: Record<string, unknown> = { url };
  if (debug) body.debug = true;

  // First attempt — may return 402 if payment is required
  let res = await fetch(FETCH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Handle x402 payment flow
  if (res.status === 402) {
    const paymentTerms: X402PaymentTerms = await res.json();

    if (paymentTerms.error !== "payment_required") {
      throw new Error(
        `Unexpected 402 response: ${JSON.stringify(paymentTerms)}`
      );
    }

    const signature = await signPayment(paymentTerms);

    // Retry with payment signature
    res = await fetch(FETCH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Payment-Signature": signature,
      },
      body: JSON.stringify(body),
    });
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `NanoParse API returned ${res.status}: ${errorText}`
    );
  }

  const data: NanoParseResponse = await res.json();
  return data;
}
