/**
 * Cross-chain handler interface contract.
 *
 * The `CrossChainStrategy` orchestrator plugs in one source handler (pre-
 * bridge) and one dest handler (post-bridge) per option. See
 * `handlers/README.md` for the architecture overview and migration notes.
 *
 * Invariants enforced by PR review (not by code):
 *
 * 1. **Token normalization at boundaries.** `fetchQuote` MUST pass tokens
 *    matching the underlying strategy's expected selection, not the caller's.
 *    Violating this reproduces the "Invalid output token" class of bug fixed
 *    by the composer deposit normalization (see Phase 0 commits).
 * 2. **Handler state is private.** `SourceHandlerQuote.state` /
 *    `DestHandlerQuote.state` are typed per-handler and only read by the
 *    handler that produced them. Downcast at the call site; no shared state
 *    between handlers.
 * 3. **Orchestrator owns bridge-shaped concerns.** Slippage on the bridged
 *    amount, bridge-token dust, `twoStep` flag, oversize fallback — all
 *    handled above the handler layer.
 * 4. **Handlers declare; they don't act.** `fetchZapSteps` returns a
 *    declarative {@link DestHandlerSteps} payload. The orchestrator encodes
 *    it into hookData and applies the oversize fallback. Passthrough simply
 *    declares an empty route — there is no separate "passthrough" code path
 *    in the orchestrator.
 * 5. **Orchestrator owns envelope assembly for normal and recovery paths.**
 *    Dst handlers expose only `fetchQuote` + `fetchZapSteps` (plus
 *    `kind`). The cross-chain flow wraps them in `stepCrossChain`; the
 *    dst-only recovery flow wraps `fetchZapSteps` in `fetchRecoveryStep`
 *    (reusing the handler quote captured at `fetchRecoveryQuote` time).
 *    Handlers never build a `UserlessZapRequest` or `Step` directly —
 *    which keeps the two paths provably consistent.
 */
import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../../../entities/chain.ts';
import type { TokenEntity } from '../../../../../entities/token.ts';
import type { VaultEntity } from '../../../../../entities/vault.ts';
import type {
  AllowanceTokenAmount,
  InputTokenAmount,
  TokenAmount,
  ZapQuoteStep,
} from '../../../transact-types.ts';
import type { OrderInput, OrderOutput, ZapStep } from '../../../zap/types.ts';
import type { ChainTransactHelpers, ZapTransactHelpers } from '../../IStrategy.ts';

/**
 * Discriminator for source-side handler behavior.
 * - `swap`: user-token-in flow (pre-bridge swap to bridge token).
 * - `vault`: vault-share-in flow (pre-bridge vault withdraw to bridge token).
 */
export type SourceHandlerKind = 'swap' | 'vault';

/**
 * Discriminator for destination-side handler behavior.
 * - `passthrough`: mint bridge token to user on dst chain; no post-bridge action.
 * - `swap`: swap bridge token to a target token on dst chain.
 * - `vault`: deposit bridge token into a vault on dst chain (includes Path C vault-dst withdraw).
 */
export type DestHandlerKind = 'passthrough' | 'swap' | 'vault';

/**
 * Quote produced by a {@link ISourceHandler}. `state` is handler-private and
 * typed per-handler so `fetchZapSteps` can downcast safely.
 */
export type SourceHandlerQuote<Q = unknown> = {
  /** For UI preview of the src-side portion of the route. */
  sourceSteps: ZapQuoteStep[];
  /** Amount of bridge token available to bridge after src execution. */
  bridgeTokenOut: BigNumber;
  /** Src-chain approvals needed by the caller. */
  allowances: AllowanceTokenAmount[];
  /** Src-chain leftovers returned to the user. */
  returned: TokenAmount[];
  /** Src-side tokens to include as `order.outputs` with `minOutputAmount=0`. */
  dustTokens: TokenEntity[];
  /**
   * True when src produced the bridge token via conversion (swap or vault withdraw);
   * false when the input already IS the bridge token. Orchestrator uses this to
   * decide whether to apply slippage to the bridge amount.
   */
  slippageAppliesToBridge: boolean;
  state: Q;
};

/** ZapStep composition returned by a {@link ISourceHandler.fetchZapSteps}. */
export type SourceHandlerSteps = {
  /** Src-chain `ZapStep`s that run before the CCTP bridge burn. */
  zapSteps: ZapStep[];
  /** Share token for vault-src; input token for swap-src. */
  orderInputs: OrderInput[];
  /** What the underlying flow produces, with slippage-applied minimums. */
  orderOutputs: OrderOutput[];
};

/**
 * Quote produced by a {@link IDestHandler}. `state` is handler-private and
 * typed per-handler so `fetchZapSteps` can downcast safely.
 */
export type DestHandlerQuote<Q = unknown> = {
  destSteps: ZapQuoteStep[];
  /**
   * Final user outputs on the dst chain. Vault shares for vault-dst,
   * target token for swap-dst, bridge token for passthrough.
   */
  outputs: TokenAmount[];
  returned: TokenAmount[];
  dustTokens: TokenEntity[];
  /**
   * Dst-chain allowances the user would need if they executed the dst work
   * directly — i.e., the two-step oversize-fallback recovery path. The
   * normal cross-chain flow ignores this because the CCTP hook executes
   * the dst work with the receiver contract's own approvals.
   */
  allowances: AllowanceTokenAmount[];
  state: Q;
};

/**
 * Context for source-side (pre-bridge) handlers. Carries only fields that
 * `SwapSourceHandler` / `VaultSourceHandler` actually read; the orchestrator
 * builds one of these per option in `makeSourceContext`.
 */
export type SourceHandlerContext = {
  /** Src-chain zap helpers (the orchestrator is bound to the page vault). */
  helpers: ZapTransactHelpers;
  sourceChainId: ChainEntity['id'];
  /** Src-side bridge token. */
  bridgeToken: TokenEntity;
  slippage: number;
  /** Page vault id — dst on deposit, src on withdraw. Used as the swap-
   *  aggregator routing hint. */
  pageVaultId: VaultEntity['id'];
  /** Async resolver for vault-bound `ZapTransactHelpers`; called by
   *  `VaultSourceHandler` with its own src vault id. */
  resolveHelpersForVault: (vaultId: VaultEntity['id']) => Promise<ZapTransactHelpers>;
};

/**
 * Context for destination-side (post-bridge) handlers. `helpers` is the
 * common denominator `ChainTransactHelpers` so the dst-only recovery path
 * can build a context from dst-chain data alone without faking src-side
 * fields. `VaultDestHandler` upgrades to `ZapTransactHelpers` via
 * `resolveHelpersForVault` when it needs the richer shape.
 */
export type DestHandlerContext = {
  /** Dst-chain helpers (accepts the common-denominator shape — swap-dst +
   *  passthrough only read `getState` + `swapAggregator`). */
  helpers: ChainTransactHelpers;
  destChainId: ChainEntity['id'];
  /** Dst-side bridge token. */
  destBridgeToken: TokenEntity;
  slippage: number;
  /** Page vault id hint for swap-aggregator routing (dst on deposit, src
   *  on withdraw/recovery). */
  pageVaultId: VaultEntity['id'];
  /** Async resolver for vault-bound `ZapTransactHelpers`; called by
   *  `VaultDestHandler` with its own dst vault id. */
  resolveHelpersForVault: (vaultId: VaultEntity['id']) => Promise<ZapTransactHelpers>;
};

/**
 * Handler for the source (pre-bridge) side of a cross-chain zap.
 *
 * **Token normalization invariant**: `fetchQuote` MUST pass tokens matching
 * the underlying strategy's expected selection, not the caller's — same rule
 * the composer strategies enforce.
 */
export interface ISourceHandler<Q = unknown> {
  readonly kind: SourceHandlerKind;
  fetchQuote(input: InputTokenAmount, ctx: SourceHandlerContext): Promise<SourceHandlerQuote<Q>>;
  fetchZapSteps(
    quote: SourceHandlerQuote<Q>,
    ctx: SourceHandlerContext
  ): Promise<SourceHandlerSteps>;
}

/**
 * ZapStep composition returned by {@link IDestHandler.fetchZapSteps}.
 * Mirrors {@link SourceHandlerSteps} — `zapSteps` run on the dst chain inside
 * `CircleBeefyZapReceiver`, `orderOutputs` is the user-visible required-output
 * set (minimums already applied), and `expectedTokens` is forwarded to the
 * cross-chain action for post-tx balance refresh.
 *
 * Passthrough returns `zapSteps: []` — same encoding flow, empty route.
 */
export type DestHandlerSteps = {
  zapSteps: ZapStep[];
  orderOutputs: OrderOutput[];
  expectedTokens: TokenEntity[];
};

/**
 * Handler for the destination (post-bridge) side of a cross-chain zap.
 * Implemented by every dst handler (passthrough, swap, vault).
 *
 * The same two methods serve both the normal cross-chain flow (called from
 * `CrossChainStrategy.quoteCrossChain` / `stepCrossChain`) and the dst-only
 * recovery path (called from `fetchRecoveryQuote` / `fetchRecoveryStep`;
 * the step path skips `fetchQuote` and reuses the handler quote captured
 * at quote time). The orchestrator owns all envelope assembly — handlers
 * never build a `UserlessZapRequest` or `Step` directly.
 */
export interface IDestHandler<Q = unknown> {
  readonly kind: DestHandlerKind;
  fetchQuote(bridgeTokenIn: BigNumber, ctx: DestHandlerContext): Promise<DestHandlerQuote<Q>>;
  fetchZapSteps(quote: DestHandlerQuote<Q>, ctx: DestHandlerContext): Promise<DestHandlerSteps>;
}
