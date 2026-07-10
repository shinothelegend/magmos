---
id: employee-vaults
title: Employee Vaults
sidebar_position: 5
---

# Employee Vaults

An employee vault is a personal, multi token store of value that runs yield strategies the employee controls. Vaults are where the yield layer extends from the organization to the individual.

## Structure

Each employee can create multiple named vaults. A vault is an owned object. Inside it, each token has its own bucket, stored as a dynamic field keyed by token name. A single vault can therefore hold USDC, USDC, and other tokens side by side.

```
EmployeeVault (owned by employee)
  bucket<USDC>
  bucket<USDC>
  ...
```

## Routing yield

For each allocation the employee specifies a percentage and a destination. The destination is either a specific protocol or automatic maximum yield.

| Code | Category |
| --- | --- |
| L | Lending protocols such as Circle USYC and USYC |
| Y | Yield bearing stablecoins such as USYC |
| S | Liquid staking tokens such as Bucket |

Automatic maximum yield is resolved off chain by the frontend, which queries live rates and picks the best one. The contract always receives an explicit protocol, never an abstract instruction. This keeps the on chain logic simple and auditable.

## Claiming into a vault

When an employee claims payroll into a vault, the claim and the deposit happen in one programmable transaction block. If the vault strategy targets a different token than the one being claimed, the swap is part of the same block. The employee moves from earned payroll to an active yield position atomically.

## Withdrawing

An employee withdraws from a bucket at any time. On withdrawal the vault returns the principal in full plus the yield earned, less the vault yield fee that applies only to the yield portion. The fee model is shared with the organization side and is detailed in [Fees](/fees).
