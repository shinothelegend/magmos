---
id: claiming
title: Claiming
sidebar_position: 4
---

# Claiming

Claiming is how an employee converts an accrued balance into spendable tokens. Magmos computes the claimable amount live, so an employee can claim at any moment and receive exactly what has accrued.

## When an employee can claim

An employee can claim whenever the claimable balance clears a small minimum. The minimum exists to prevent dust spam and is set to roughly a tenth of a week of pay at the current rate. The minimum is bypassed whenever there is a crystallized pending balance, so a rate change never locks funds.

Employees can claim while paused or stopped. They receive everything earned up to the point streaming halted.

## What happens on claim

The claim path verifies the live balance, makes sure the pool can cover it by pulling from yield positions if needed, and then transfers the tokens to the claimer. The contract pays the sender exactly what the formula says. No role can inflate the claimable amount or redirect the output.

```
compute claimable
if pool balance < claimable
  cover the shortfall from yield positions
assert pool balance >= claimable
transfer claimable to employee
```

## Claim destinations

On claim, the employee chooses where the funds go.

**To a wallet.** The simplest path. The claimed coin lands directly in the employee wallet.

**To a vault.** The employee names a target vault and a yield routing, and the funds are swapped and deposited into the vault in the same transaction. This means an employee can go from streaming payroll straight into a yield strategy without a second step. See [Employee Vaults](/concepts/employee-vaults).

## Live balance in the portal

The employee portal discovers an employee pools directly from on chain events, then polls the claimable amount and interpolates between polls so the balance ticks up smoothly on screen. The display is driven entirely by the chain, so it works even if the backend is unavailable.
