// Circle Modular Wallets — passkey (WebAuthn) smart-account onboarding on Arc.
//
// Non-crypto recipients sign in with a passkey (Face ID / fingerprint) instead of a seed
// phrase, get a Circle Smart Account on Arc, and can claim gaslessly. Modular Wallets are
// viem-compatible and support Arc.
//
// ENABLE: set NEXT_PUBLIC_CIRCLE_CLIENT_KEY + NEXT_PUBLIC_CIRCLE_CLIENT_URL from
// console.circle.com → Modular Wallets → Web SDK. The Client URL is chain-specific (Arc
// testnet) — copy it exactly from the console. Until both are set, `circleEnabled` is false
// and the UI falls back to the standard wallet connect.

import {
  toPasskeyTransport,
  toModularTransport,
  toWebAuthnCredential,
  toCircleSmartAccount,
  WebAuthnMode,
  modularWalletActions,
} from "@circle-fin/modular-wallets-core";
import { createPublicClient } from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { arcTestnet } from "./wagmi";

const CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY;
const CLIENT_URL = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL;
// Circle chain slug for Arc testnet (appended to the modular transport URL).
const CHAIN_SLUG = "arcTestnet";

export const circleEnabled = Boolean(CLIENT_KEY && CLIENT_URL);

function transports() {
  if (!CLIENT_KEY || !CLIENT_URL) {
    throw new Error(
      "Circle Wallets not configured — set NEXT_PUBLIC_CIRCLE_CLIENT_KEY and NEXT_PUBLIC_CIRCLE_CLIENT_URL"
    );
  }
  return {
    // Passkey transport uses the base URL; modular (RPC) transport appends the chain slug.
    passkeyTransport: toPasskeyTransport(CLIENT_URL, CLIENT_KEY),
    modularTransport: toModularTransport(`${CLIENT_URL}/${CHAIN_SLUG}`, CLIENT_KEY),
  };
}

/** Register a brand-new passkey for a recipient (first-time onboarding). */
export async function registerPasskey(username: string) {
  const { passkeyTransport } = transports();
  return toWebAuthnCredential({
    mode: WebAuthnMode.Register,
    transport: passkeyTransport,
    username,
  });
}

/** Log in with an existing passkey (returning recipient). */
export async function loginPasskey() {
  const { passkeyTransport } = transports();
  return toWebAuthnCredential({ mode: WebAuthnMode.Login, transport: passkeyTransport });
}

/** Build the Arc Smart Account + bundler client from a WebAuthn credential. */
export async function smartAccountFrom(credential: Awaited<ReturnType<typeof registerPasskey>>) {
  const { modularTransport } = transports();
  const client = createPublicClient({ transport: modularTransport, chain: arcTestnet });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const account = await toCircleSmartAccount({ client: client as any, owner: credential });
  const bundler = createBundlerClient({
    account,
    chain: arcTestnet,
    transport: modularTransport,
  }).extend(modularWalletActions);
  return { account, bundler, address: account.address as `0x${string}` };
}

/** Send a gasless call (e.g. claim / send-home) from the recipient's smart account. */
export async function sendGaslessCall(
  ctx: Awaited<ReturnType<typeof smartAccountFrom>>,
  call: { to: `0x${string}`; data?: `0x${string}`; value?: bigint }
): Promise<`0x${string}`> {
  const hash = await ctx.bundler.sendUserOperation({ account: ctx.account, calls: [call] });
  return hash as `0x${string}`;
}
