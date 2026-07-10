---
id: fees
title: Fees
sidebar_position: 6
---

# Fees

Magmos charges three fees across two sides of the protocol. Employees always receive their full salary. There is never a deduction at claim time. All fee logic lives in the contract, and every rate is bounded by a hard cap that even an admin cannot exceed.

## How Magmos compares

Most streaming payroll protocols charge little or nothing, and none of them put idle funds to work. The yield layer is the differentiator.

| Protocol | Chain | Fee | Who pays |
| --- | --- | --- | --- |
| Streamflow | Solana | 0.25 percent on streamed amount | Sender |
| Sablier | EVM | One dollar flat per withdrawal | Recipient |
| Superfluid | EVM | None today | None |
| LlamaPay | EVM | None | None |
| Magmos | Arc | Deposit plus yield share | Sender and yield earner |

## Fee one. Deposit fee

Charged to the organization at every deposit and top up.

```
gross = payment amount
fee   = gross * deposit_fee_bps / 10000
net   = gross - fee
```

The treasury receives the fee. The pool receives the net, which is what employees stream from. Charging at deposit means the organization pays once when it funds, and employees always claim their full amount. The suggested launch value is twenty five basis points, which matches the only competitor that charges a meaningful sender side fee.

## Fee two. Org yield fee

Charged to the organization on the yield portion only, and only when a yield position is unwound. This happens when a claim draws the pool down past its idle balance, or when the organization explicitly withdraws from a position.

```
withdrawn     = amount returned by the protocol
principal     = deposited_value * withdrawn / total_position_value
yield         = withdrawn - principal
fee           = yield * org_yield_fee_bps / 10000
net_to_pool   = withdrawn - fee
```

The principal is always returned in full. If a pool always has enough idle balance to pay claims, positions are never unwound and this fee never triggers. The suggested launch value is ten percent of yield.

## Fee three. Vault yield fee

Charged to the employee on the yield portion of a vault position, and only when the position is withdrawn.

```
withdrawn     = amount returned by the protocol
principal     = deposited_value * withdrawn / total_position_value
yield         = withdrawn - principal
fee           = yield * vault_yield_fee_bps / 10000
net_to_bucket = withdrawn - fee
```

The employee owns their salary in full. Charging only on vault yield means Magmos earns when the employee strategy earns. Incentives stay aligned. The suggested launch value is ten percent of yield.

## Configuration and caps

All three fees live in the protocol config in the registry and are updated by the fee manager role. No contract upgrade is needed to change them. Hard caps are enforced in the contract.

```
deposit_fee_bps      max 500   five percent
org_yield_fee_bps    max 5000  fifty percent
vault_yield_fee_bps  max 5000  fifty percent
```

## What is never charged

- Employee salary principal. Employees always receive their full claimable amount.
- Pause, resume, and stop operations.
- Vault creation.
- Registry reads.
