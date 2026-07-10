---
id: quick-start
title: Quick Start
sidebar_position: 2
---

# Quick Start

This guide adds a working pay button to a React application in a few minutes.

## Install

```bash
npm install @magmos/react
```

## Add the button

The simplest integration is the drop in button. It bundles its own wallet and query providers, so it works on any page with no extra setup.

```tsx
import { SweemPayButton } from "@magmos/react";

export function Checkout() {
  return (
    <SweemPayButton
      apiKey="pk_live_your_key"
      amount={100}
      token="USDC"
      onSuccess={({ digest, recipient }) => {
        console.log("paid", digest, "to", recipient);
      }}
    />
  );
}
```

When the payer completes the transfer, `onSuccess` fires with the transaction digest and the recipient address. Use the digest to confirm settlement on chain or to reconcile against your own records.

## Flexible amount

Omit the amount to let the payer enter one at checkout. This is useful for donations, top ups, and open invoices.

```tsx
<SweemPayButton apiKey="pk_live_your_key" token="USDC" onSuccess={handleSuccess} />
```

## Using the modal directly

If your app already uses the Arc dapp kit, use the modal and provide your own providers. This avoids loading a second wallet context.

```tsx
import { PayModal } from "@magmos/react";

<PayModal
  apiKey="pk_live_your_key"
  amount={50}
  token="USDC"
  open={open}
  onOpenChange={setOpen}
  onSuccess={handleSuccess}
/>;
```

## Resolving config yourself

For full control over the UI, resolve the merchant config and build the transaction directly.

```ts
import { fetchCheckoutConfig, buildPaymentTx } from "@magmos/react";

const config = await fetchCheckoutConfig("pk_live_your_key");
const tx = buildPaymentTx({
  recipient: config.recipient,
  amount: 100,
  token: "USDC",
});
```

You then sign and execute the transaction with your own wallet hook.
