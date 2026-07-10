---
id: api-keys
title: API Keys
sidebar_position: 3
---

# API Keys

A publishable key links a checkout to a merchant. The SDK uses it to look up where funds should go and how to present the payment. Keys are safe to ship in client code, since they only resolve public merchant details and never authorize a withdrawal.

## Key shape

A key looks like this.

```
pk_live_<random hex>
```

It is generated with a cryptographically secure random source and stored against the organization that created it.

## Managing keys

Keys are managed through the organization endpoints. Creating and revoking a key requires the organization signature. Listing keys is public, since the keys are publishable by design.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/v1/orgs/:wallet/keys` | Yes | Create a key |
| GET | `/v1/orgs/:wallet/keys` | No | List active keys |
| DELETE | `/v1/orgs/:wallet/keys/:id` | Yes | Revoke a key |

A key can carry an optional receiving address that overrides the organization wallet. This lets a merchant route a specific checkout to a separate wallet without creating a new organization.

## Revocation

Revoking a key is a soft delete. The record is stamped with a revocation time rather than removed. The public checkout config endpoint filters out revoked keys, so a revoked key stops resolving immediately while the historical record is preserved.

## Resolving a key

The SDK and any client resolve a key through the public checkout config endpoint.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/v1/checkout/config?pk=` | No | Resolve a key to merchant config |

The response includes the merchant name, the logo, the recipient address, and the supported tokens. This endpoint is served with cross origin access enabled so it can be called from any merchant site.
