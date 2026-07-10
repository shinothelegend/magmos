---
id: overview
title: SDK Overview
sidebar_position: 1
---

# SDK Overview

The Magmos checkout SDK lets any website accept payments on HashKey Chain with a drop in React component. A merchant generates a publishable key, embeds a button, and receives funds directly to their wallet. Magmos never holds the money.

## Package

```
@magmos/react
```

The package ships dual module and CommonJS builds and lists React and React DOM as peer dependencies.

## What it exports

| Export | Purpose |
| --- | --- |
| `SweemPayButton` | A complete drop in button that bundles its own providers |
| `PayModal` | A standalone modal for apps that already use the Arc dapp kit |
| `SweemProvider` | A wallet and query context wrapper for the button or modal |
| `fetchCheckoutConfig` | Resolves a publishable key to merchant details |
| `buildPaymentTx` | Builds the token transfer transaction |

## How a payment flows

1. The merchant generates a publishable key from the dashboard.
2. The merchant embeds the button with the key, an amount, and a token.
3. The SDK resolves the key through the public checkout config endpoint, which returns the merchant name, logo, recipient address, and supported tokens.
4. The payer connects a wallet, confirms the amount, and signs the transfer.
5. The transfer settles directly to the merchant recipient address, and the success callback fires with the transaction digest.

## Supported tokens

The checkout currently supports USDC and USDC. The recipient address is resolved server side from the publishable key, with an optional per key override, so the merchant never has to expose a wallet address in client code.

## Reading on

Start with the [Quick Start](/sdk/quick-start) to add a button in a few lines. Then see [API Keys](/sdk/api-keys) for key management and [Payment Links](/sdk/payment-links) for the no code sharing flow.
