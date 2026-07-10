---
id: payment-links
title: Payment Links
sidebar_position: 4
---

# Payment Links

Payment links are a no code way to request a payment. A merchant fills a short form, gets a shareable link and a QR code, and the payer settles on a hosted checkout page. No backend record is required, since the link itself carries everything.

## Stateless by design

A payment link encodes its entire payload into the URL. The form data is serialized to JSON and packed into a URL safe base64 slug. The hosted page decodes the slug and renders the checkout. There is no database lookup, so a link works the moment it is created and keeps working as long as the URL exists.

The payload records the title, the mode, the token, an optional fixed amount, the destination, the pay to address, and the merchant name.

## Modes

| Mode | Behavior |
| --- | --- |
| Fixed | The amount is set by the merchant and locked at checkout |
| Flexible | The payer enters the amount, useful for donations and open invoices |

## Creating and sharing

The dashboard provides a create flow and a share panel. The merchant chooses a title, a mode, a token, an amount if fixed, and a destination, which can be a wallet or a pool. The share panel then offers three ways to distribute the link.

| Channel | What it is |
| --- | --- |
| URL | The direct link to the hosted checkout |
| QR code | A scannable version of the same link |
| Embed | An HTML snippet styled in the Magmos brand to drop into any site |

Created links are tracked locally per wallet so a merchant can revisit and manage them. Because the link is self contained, the local record is a convenience, not a dependency.

## The checkout page

The hosted page lives at a path under `/pay`. It decodes the slug, renders the form, asks the payer to connect a wallet, and builds the transfer transaction. On success it shows a confirmation with an explorer link to the settled transaction.

## Sending by email

The dashboard can email a link. A server route sends a branded HTML message containing the link and the QR code through Resend. If email is not configured, the flow falls back to a prefilled mail composer so the merchant can still send the link from their own client.
