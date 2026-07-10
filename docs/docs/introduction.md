---
id: introduction
title: Introduction
slug: /
sidebar_position: 1
---

# Introduction

Magmos is a streaming payroll protocol on Arc with a native yield layer. Organizations deposit funds into payment pools and stream salaries to employees continuously, accruing value every millisecond. While funds sit unclaimed they earn yield through integrated lending protocols, and that yield flows to the organization. When employees claim, they can route their pay into personal vaults running their own yield strategies.

The yield layer is what sets Magmos apart. Other streaming payroll protocols move money on a schedule. Magmos puts idle payroll to work the moment it is deposited and keeps earning until the last millisecond before a claim.

## Why streaming

Traditional payroll settles in fixed cycles. Money is locked in an account doing nothing until payday. Streaming replaces that with a continuous flow. An employee earns a precise, claimable balance at every moment, and an organization funds payroll once rather than running a batch every period.

On Arc this is efficient. Each token type gets one shared pool, and Arc parallel execution lets many employees claim from the same pool without contention.

## What you can do with Magmos

Magmos covers both sides of payroll and one way to get paid by anyone.

| For | What you get |
| --- | --- |
| Organizations | Fund a pool once, stream salaries to your whole team, and earn yield on idle payroll |
| Employees | Watch your balance accrue in real time, claim any time, and route pay into a personal yield vault |
| Anyone accepting payments | Share a payment link or drop a checkout button on any site and settle straight to your wallet |

## How it works at a glance

Your funds always stay on chain. Magmos never custodies money. Every payment, claim, and deposit is a transaction signed by you, from your own wallet. Names, labels, and preferences are stored off chain to keep the experience fast, but value only ever moves when you sign for it.

A typical lifecycle looks like this.

1. An organization registers, then creates one stream pool per token it pays in.
2. It funds the pool and starts streams for its employees, each with a rate.
3. Idle funds are invested into a yield protocol chosen by the organization.
4. Employees watch their balance accrue and claim whenever they choose.
5. On claim, funds can be routed into a personal vault with a custom strategy.

## Where to go next

To understand how payroll streaming works, start with [Concepts](/concepts/streaming-payroll). To accept payments on your own site, see [Accept Payments](/sdk/overview). For how fees work, see [Fees](/fees).
