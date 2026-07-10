---
id: yield-layer
title: Yield Layer
sidebar_position: 3
---

# Yield Layer

The yield layer is the feature no other streaming payroll protocol offers. Funds that sit in a pool waiting to be claimed do not have to be idle. They can be invested into lending and yield protocols, and the returns flow back to the organization.

## How it works

When an organization deposits or tops up a pool, it chooses how to route the idle balance. The funds can be split across several yield protocols or kept idle. Each position is tracked on the pool as a dynamic field recording the deposited value.

Three categories of yield are supported.

| Code | Category | Examples |
| --- | --- | --- |
| L | Lending protocols | Circle USYC |
| Y | Yield bearing stablecoins | USYC |
| S | Liquid staking tokens | Bucket |

An organization can hold positions in more than one protocol on the same pool at the same time. Positions coexist, and the dashboard shows the blended return.

## Covering a claim

When an employee claims and the idle pool balance is not enough to cover it, the contract pulls the shortfall from the yield positions. This happens in one programmable transaction block. Each protocol exposes a cover function that withdraws just enough, and then the claim settles.

```
cover_claim_from_scallop(amount needed from Circle USYC)
cover_claim_from_navi(remainder needed from USYC)
claim()
```

Only what is required to cover the claim is withdrawn. The rest of the position keeps earning.

## Rebalancing

An organization can move funds between protocols without touching employee streams. A withdraw function returns funds from one protocol to the pool, and an invest function deploys them into another. This lets an organization chase the best available rate as conditions change.

## Returns and fees

The principal is always returned in full. Magmos charges a fee only on the yield portion, and only when a position is actually unwound. If a pool always has enough idle balance to pay claims, positions are never unwound and no yield fee is ever charged. See [Fees](/fees) for the full model.

## Coverage floor

Each pool carries a minimum coverage requirement set at creation. It guarantees that at least a configured number of weeks of committed payroll stays reserved, so an organization cannot invest so aggressively that it cannot pay its people.
