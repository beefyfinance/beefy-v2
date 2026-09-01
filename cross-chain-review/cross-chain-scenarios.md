# Cross-Chain / CCTP Zap — Scenario Catalog (current behavior + ideal)

Phase-1 audit of every cross-chain (CCTP) zap scenario: what the code does today, the exact copy the user sees, the gap, and a short "ideal" note. Screenshots for each are captured with the DEV **Cross-Chain Scenario Simulator** (see `README.md`); the `sim` column gives the preset id.

Legend: ✓ handled · ⚠ partial / confusing · ✗ gap / silent failure.

## State vocabulary

- **StepContent** (`stepper-types.ts`): `StartTx, WalletTx, WaitingTx, ErrorTx, SuccessTx, BridgingTx, RecoveryTx`.
- **CrossChainOpStatus** (`transact-types.ts`): `source-pending, source-done, source-failed, dest-pending, dest-done, dest-failed, dest-recovered`.
- **MessageLifecycleState** (CCTP relay): `discovered, awaiting_attestation, pending_attestation, attestation_received, awaiting_message_received, ready_to_relay, pending_tx, confirmed, zap_failed, cancelled, abandoned`.
- Quote pipeline (5 legs): source handler (swap|vault) → Beefy+CCTP fee → CCTP bridge → dest handler (passthrough|swap|vault) → slippage/assembly.

> **Persistence reality (important):** neither `ui.stepperState` nor `ui.transact` is persisted (`reducers.ts:102,114`). A page reload wipes the pending op, bridge status, and recovery quote; the relay only exposes lookup by source-tx-hash (`cctp-api.ts`), and polling only starts in-session from `stepperUpdate`. So **there is no resume/rehydrate after reload** — the reload rows below reflect that.

---

## A. Pre-execution / quote

| id | scenario | current UI + copy | state | gap | ideal | sim |
|----|----------|-------------------|-------|-----|-------|-----|
| A.1 | Amount below bridge fee | ErrorTx: friendly "amount too low to cover the bridge fee" + raw `CrossChainBridgeBelowFeeError` | ✓ | none | keep; ideally block at input with inline hint before quote | `deposit-error` |
| A.2 | Zero amount | Quote blocked (`Can not quote for 0`) | ✓ | no friendly copy (but no modal either) | inline "enter an amount" | — |
| A.3 | No route / no options | Empty options list, CTA disabled | ⚠ | no "unavailable on this chain" message | explicit "cross-chain not available for X→Y" | — |
| A.4 | Unsupported chain pair | Option enumeration silently drops (`Promise.allSettled`) | ⚠ | user can't tell why an option vanished | log + (rare) surface | — |
| A.5 | Insufficient balance | No app pre-check; wallet rejects at submit | ⚠ | late, confusing wallet error | pre-validate vs balance, disable CTA | — |
| A.6 | Slippage | Min-out shown in quote; enforced on-chain | ✓ | none | keep | — |

## B. Source leg

| id | scenario | current UI + copy | state | gap | ideal | sim |
|----|----------|-------------------|-------|-----|-------|-----|
| B.1 | User rejects wallet | Op dismissed, stepper closes | ✓ | none | keep | — |
| B.2 | Source tx reverts | `source-failed`; error surfaced | ✓ | **no recovery path — funds/allowance on source** | retry same-chain; explain funds are safe on source | — |
| B.3 | Wrong network at submit | Throws "Please switch to {chain}" | ✓ | none | keep | — |
| B.4 | Approval rejected | ErrorTx; stepper restarts | ✓ | none | keep | — |
| B.5 | Approval reverts | ErrorTx "Transaction failed" | ✓ | none | keep | — |
| B.6 | Insufficient gas (source) | Wallet error, no pre-check | ⚠ | confusing wallet error | pre-check native balance | — |

## C. Bridge / attestation

| id | scenario | current UI + copy | state | gap | ideal | sim |
|----|----------|-------------------|-------|-----|-------|-----|
| C.1 | Bridge pending (normal) | BridgingTx spinner: "Cross-chain … in progress / Waiting for bridge…" | ✓ | no ETA/timeout | show ETA from `time.incoming/outgoing`; per-stage progress from `lifecycleState` | `deposit-bridging`, `withdraw-bridging` |
| C.2 | Bridge slow / stuck | Spinner forever; poll never stops | ✗ | **CRITICAL** no timeout | after N min: "taking longer than usual", link to explorer / support, keep polling | `deposit-bridging` |
| C.3 | Attestation never arrives | Spinner forever; no detection | ✗ | **CRITICAL** silent | same as C.2; detect stalled `lifecycleState` | `deposit-bridging` |
| C.4 | Page reload while bridging | Op lost; nothing restored | ✗ | **CRITICAL** (worse than "poll doesn't resume" — state is gone) | persist op + resume poll (or rehydrate from relay by address) | — |
| C.5 | RPC/relay failure during poll | Silent retry every 2s | ✓ | none | keep; add backoff | — |
| C.6 | Hash mismatch / bad opId | Empty message list → polls forever | ⚠ | same as C.2 | bound retries; surface | — |

## D. Destination leg

| id | scenario | current UI + copy | state | gap | ideal | sim |
|----|----------|-------------------|-------|-----|-------|-----|
| D.1 | Dest tx reverts (`dstZapSuccess=false`) | → RecoveryTx | ✓ | none | keep | `recovery-deposit-fetchquote` |
| D.2 | Dest amount below min | Reverts → recovery | ✓ | none | keep | — |
| D.3 | User rejects finalise | Error; recovery UI stays; can retry | ✓ | none | keep | `recovery-deposit-error` |
| D.4 | Dest swap no liquidity | → RecoveryTx "final swap couldn't complete" | ✓ | none | keep | `recovery-deposit-fetchquote` |
| D.5 | Wrong dest chain at finalise | "Please switch to {chain}" | ✓ | none | keep | `recovery-deposit-wrongchain` |
| D.6 | Dest tx exceeds gas limit | Wallet error, no pre-check | ⚠ | rare | pre-estimate | — |
| D.7 | Two-step (oversized hook) | Bridge to wallet, then RecoveryTx to finalise | ✓ | copy doesn't explain "two-step" | explain the two-step up front | `recovery-deposit-fetchquote` |

## E. Recovery

| id | scenario | current UI + copy | state | gap | ideal | sim |
|----|----------|-------------------|-------|-----|-------|-----|
| E.1 | Recovery quote fetch fails | Auto-fetch error only logged; **`RecoveryQuoteErrorAlert`** now shows on the vault form; button says "Refresh quote" | ⚠ | in the stepper modal the failure isn't explained until retry | surface the fetch error inside RecoveryContent too | `recovery-deposit-fetchquote` |
| E.2 | Quote stale (after failed attempt) | Marked stale → "Refresh quote" | ✓ | none | keep | `recovery-deposit-error` |
| E.3 | Finalise (recovery) tx reverts | Stays RecoveryTx (isRecovery flag), quote stale, retry + Close | ✓ | none | keep | `recovery-deposit-error` |
| E.4 | No gas on dest for finalise | Message adds "You need some {ETH} on {chain}…" | ✓ | none | keep; maybe deep-link to bridge gas | `recovery-deposit-fetchquote-nogas`, `recovery-deposit-finalise-nogas` |
| E.5 | Valid quote → finalise | "Finalise deposit/withdrawal" button | ✓ | none | keep | `recovery-deposit-finalise`, `recovery-withdraw-finalise` |
| E.6 | Abandoned / unknown | "…couldn't complete automatically, but your funds are safe" + "team notified", Close only | ✓ | user has no self-serve action | keep; add support link / opId | `recovery-deposit-abandoned`, `page-recovery-unknown` |
| E.7 | Refund shown | Message includes refunded USDC amount | ✓ | none | keep | `recovery-deposit-refund` |
| E.8 | Not connected during recovery | Message only, no button | ⚠ | no explicit Connect CTA in modal (page has one) | add Connect in RecoveryContent | `recovery-deposit-notconnected`, `page-recovery-notconnected` |
| E.9 | User abandons recovery (Close) | Op stays in Redux (session only) | ⚠ | no warning funds await on dest; lost on reload | warn + persist so it can be resumed | — |
| E.10 | Recovery success | → SuccessTx; balances refreshed | ✓ | balance refresh only covers USDC | expand refreshed tokens | `page-recovery-complete` |

## F. Success variants

| id | scenario | current UI + copy | state | gap | ideal | sim |
|----|----------|-------------------|-------|-----|-------|-----|
| F.1 | Full success (received) | "You deposited/withdrew … received line" | ✓ | none | keep | `deposit-success`, `withdraw-success` |
| F.2 | Received + dest dust | received + "… was not used and returned to you" | ✓ | none | keep | `deposit-success-dstdust`, `withdraw-success-dstdust` |
| F.3 | Received + source dust | dust grouped by source chain | ✓ | needs source chain tokens loaded | keep | `deposit-success-srcdust` |
| F.4 | Received + both dust | dust grouped by chain (`ChainGroupedTokens`) | ✓ | none | keep | `deposit-success-bothdust` |
| F.5 | LP / CLM vs single symbol | non-single → "LP"; single → deposit-token symbol; ppfs applied | ✓ | none | keep | driven by open vault |

## G. Reload / persistence

| id | scenario | current UI + copy | state | gap | ideal | sim |
|----|----------|-------------------|-------|-----|-------|-----|
| G.1 | Reload while bridging | Op **lost**; stepper closed; nothing restored | ✗ | **CRITICAL** | persist + resume (see C.4) | — |
| G.2 | Reload during recovery | Op **lost**; no recovery UI afterward | ✗ | **CRITICAL** | persist pending ops; rehydrate recovery | — |
| G.3 | Reload during error | Error not re-shown | ⚠ | user may think it succeeded | persist last error or clear input | — |
| G.4 | Reload on wrong chain | Dst-token fetch on wrong chain fails silently | ⚠ | incomplete success shown | guard by chain | — |

---

## Gap summary (drives Phase 2)

**Critical**
- **Reload wipes in-flight ops** (C.4, G.1, G.2) — no persistence, no resume, no rehydrate. The relay is the durable source of truth but is only queried by source-tx-hash; a by-address listing + startup rehydrate would fix it.
- **Bridge stuck / attestation never arrives** (C.2, C.3) — infinite spinner, no timeout, no escape hatch.

**Significant**
- No source-leg recovery (B.2); insufficient balance/gas not pre-checked (A.5, B.6, D.6); recovery-quote fetch error under-surfaced in the modal (E.1); no-connect CTA missing in the modal (E.8); abandon-without-warning + lost on reload (E.9).

**Minor / polish**
- No ETA or per-stage progress during bridging (C.1); no "unavailable" message when routes are empty (A.3); two-step not explained up front (D.7); recovery balance-refresh only covers USDC (E.10); dust silently skipped if token unknown.
