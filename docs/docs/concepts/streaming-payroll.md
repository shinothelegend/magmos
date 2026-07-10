---
id: streaming-payroll
title: Streaming Payroll
sidebar_position: 1
---

# Streaming Payroll

Streaming payroll replaces fixed pay cycles with a continuous flow of value. An employee earns a precise balance at every moment, and that balance becomes claimable the instant it accrues.

## Streams

Each employee in a pool has a stream. A stream records how fast value accrues and how much has already been earned. On chain it is stored as an entry in the pool table keyed by the employee address.

The two values that drive accrual are the rate amount and the rate period. Together they describe how many tokens are earned over a window of time.

```
rate_amount    tokens earned per period
rate_period_ms length of that period in milliseconds
```

A monthly salary is expressed as the salary amount over a period of thirty days in milliseconds. An hourly rate is the hourly amount over one hour in milliseconds.

## Claimable amount

The claimable balance is computed live from the clock. The contract takes the elapsed time since the last claim, subtracts any paused time, and multiplies by the rate.

```
effective_end = paused_at or stopped_at or now
elapsed       = effective_end - last_claimed_at - total_paused_ms
new_earned    = elapsed * rate_amount / rate_period_ms
claimable     = pending_balance + new_earned
```

All arithmetic uses overflow safe multiply and divide so large balances and high precision tokens never wrap.

## Pay modes

There are two ways to set rates.

**Individual rate.** Each employee has their own rate amount and period, monthly or hourly. This is the default for most rosters.

**Group share.** The organization sets a total stream rate for a group and each employee receives a percentage of it. This keeps a department budget fixed while distributing it across members.

## Pause, resume, and stop

An organization can pause a stream temporarily or stop it permanently.

Pausing freezes accrual. The paused duration is tracked so that when the stream resumes, no value is earned for the time it was paused. Stopping is permanent and sets a final end time. In both cases the employee keeps everything earned up to the point streaming halted and can still claim it.

Removing an employee does not destroy their earned balance. Freed runway stays in the pool and extends how long the remaining employees can be paid.

## Crystallization on rate change

When an organization changes an employee rate, the contract first crystallizes everything earned at the old rate into a pending balance, then applies the new rate going forward. A rate change can never reduce pay that was already earned.
