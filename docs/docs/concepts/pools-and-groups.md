---
id: pools-and-groups
title: Pools and Groups
sidebar_position: 2
---

# Pools and Groups

Magmos separates two ideas that are easy to confuse. A pool is an on chain object that holds funds and streams. A group is an off chain label used for organization in the dashboard.

## Stream pools

An organization creates one stream pool per token type. Every employee paid in that token streams from the same pool. A company paying salaries in USDC and bonuses in USDC would run two pools.

This design keeps on chain objects minimal and leverages Arc parallel execution. Separate pools exist for separate tokens, not for separate departments. All employees of a token live in one streams table inside that token pool.

```
StreamPool<USDC>
  balance        idle uninvested cash
  streams        table of employee address to stream
  total_deposited
  total_claimed
```

## Groups

Groups such as Engineering or Marketing are a presentation concept. They are stored in the database as a mapping from a group name to a set of employee addresses. On chain there is no notion of a group. Every employee is simply an entry in the token pool.

This means you can reorganize teams, rename departments, or move people between groups without any on chain transaction. The grouping is metadata.

## Funding multiple groups at once

Because groups share a token pool, funding several groups is a single atomic transaction. The frontend builds one programmable transaction block that splits the organization coin and deposits or tops up each target in the same call.

```
splitCoins(orgCoin)
deposit(poolA, ...)
topup(poolB, ...)
```

If any part fails the whole transaction reverts, so balances never end up half funded.

## Pool registration

The on chain pool is the source of truth for funds. The backend keeps a lightweight record that maps an organization and token to a pool object id, so the dashboard can locate the pool and read its live state through Arc RPC. There is one such record per organization per token.
