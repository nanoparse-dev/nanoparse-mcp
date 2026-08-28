import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, type Hex } from "viem";
import { base } from "viem/chains";

function getWalletKey(): Hex {
  const key = process.env.NANOPARSE_WALLET_KEY;
  if (!key) {
    throw new Error(
      "NANOPARSE_WALLET_KEY environment variable is not set. " +
        "Copy .env.example to .env and add your Base wallet private key."
    );
  }
  if (!key.startsWith("0x")) {
    return `0x${key}` as Hex;
  }
  return key as Hex;
}

/**
 * Payment terms returned by NanoParse in a 402 response body.
 * These are the fields the client must sign before retrying.
 */
interface X402PaymentTerms {
  error: "payment_required";
  scheme: "exact";
  network: string; // e.g. "eip155:8453"
  asset: string; // USDC on Base contract address
  amount: string; // base units (6 decimals)
  payTo: string; // merchant wallet address
  free_calls_used: number;
  free_calls_limit: number;
}

/**
 * Sign x402 payment terms using the wallet key and return the
 * signature for the Payment-Signature header.
 *
 * The signature is created by signing a JSON-serialized
 * representation of the payment terms with the wallet's private key.
 * The x402 facilitator at x402.org verifies and settles the
 * transaction — the client never constructs raw blockchain
 * transactions directly.
 *
 * The wallet key is read from NANOPARSE_WALLET_KEY and is never
 * logged, printed, or included in error output.
 */
export async function signPayment(
  paymentTerms: X402PaymentTerms
): Promise<string> {
  const key = getWalletKey();
  const account = privateKeyToAccount(key);

  const client = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  // Serialize the payment terms deterministically for signing.
  // The x402 facilitator expects a JSON payload with sorted keys.
  const payload = JSON.stringify(
    {
      scheme: paymentTerms.scheme,
      network: paymentTerms.network,
      asset: paymentTerms.asset,
      amount: paymentTerms.amount,
      payTo: paymentTerms.payTo,
    },
    Object.keys(paymentTerms).sort()
  );

  const signature = await client.signMessage({
    account,
    message: payload,
  });

  return signature;
}
