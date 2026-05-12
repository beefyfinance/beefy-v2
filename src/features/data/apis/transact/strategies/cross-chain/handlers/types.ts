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

/** Source handler kind: 'swap' (token-in → bridge), 'vault' (vault-share-in → bridge). */
export type SourceHandlerKind = 'swap' | 'vault';

/** Dest handler kind: 'passthrough' (bridge → user), 'swap' (bridge → target token), 'vault' (bridge → vault deposit). */
export type DestHandlerKind = 'passthrough' | 'swap' | 'vault';

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
  /** True when src produced the bridge token via conversion; orchestrator uses this to decide whether to apply slippage to the bridge amount. */
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

export type DestHandlerQuote<Q = unknown> = {
  destSteps: ZapQuoteStep[];
  /** Final user outputs on the dst chain (vault shares, target token, or bridge token depending on handler). */
  outputs: TokenAmount[];
  returned: TokenAmount[];
  dustTokens: TokenEntity[];
  /**
   * Dst-chain allowances the user would need on the recovery (oversize-fallback) path.
   * Normal flow ignores this — the CCTP hook executes with the receiver contract's own approvals.
   */
  allowances: AllowanceTokenAmount[];
  state: Q;
};

/** Context passed to source-side handlers (pre-bridge). */
export type SourceHandlerContext = {
  /** Src-chain zap helpers (the orchestrator is bound to the page vault). */
  helpers: ZapTransactHelpers;
  sourceChainId: ChainEntity['id'];
  /** Src-side bridge token. */
  bridgeToken: TokenEntity;
  slippage: number;
  /** Page vault id — dst on deposit, src on withdraw. Used as the swap-aggregator routing hint. */
  pageVaultId: VaultEntity['id'];
  /** Async resolver for vault-bound `ZapTransactHelpers`; called by `VaultSourceHandler` with its own src vault id. */
  resolveHelpersForVault: (vaultId: VaultEntity['id']) => Promise<ZapTransactHelpers>;
};

/**
 * Context passed to dest-side handlers (post-bridge). `helpers` is the common-denominator
 * `ChainTransactHelpers` so the dst-only recovery path can build a context without src-chain data.
 */
export type DestHandlerContext = {
  /** Dst-chain helpers (common-denominator shape; vault-dst upgrades via `resolveHelpersForVault`). */
  helpers: ChainTransactHelpers;
  destChainId: ChainEntity['id'];
  /** Dst-side bridge token. */
  destBridgeToken: TokenEntity;
  slippage: number;
  /** Page vault id hint for swap-aggregator routing (dst on deposit, src on withdraw/recovery). */
  pageVaultId: VaultEntity['id'];
  /** Async resolver for vault-bound `ZapTransactHelpers`; called by `VaultDestHandler` with its own dst vault id. */
  resolveHelpersForVault: (vaultId: VaultEntity['id']) => Promise<ZapTransactHelpers>;
};

export interface ISourceHandler<Q = unknown> {
  readonly kind: SourceHandlerKind;
  fetchQuote(input: InputTokenAmount, ctx: SourceHandlerContext): Promise<SourceHandlerQuote<Q>>;
  fetchZapSteps(
    quote: SourceHandlerQuote<Q>,
    ctx: SourceHandlerContext
  ): Promise<SourceHandlerSteps>;
}

/** ZapStep composition returned by {@link IDestHandler.fetchZapSteps}; passthrough returns an empty `zapSteps`. */
export type DestHandlerSteps = {
  zapSteps: ZapStep[];
  orderOutputs: OrderOutput[];
  expectedTokens: TokenEntity[];
};

export interface IDestHandler<Q = unknown> {
  readonly kind: DestHandlerKind;
  fetchQuote(bridgeTokenIn: BigNumber, ctx: DestHandlerContext): Promise<DestHandlerQuote<Q>>;
  fetchZapSteps(quote: DestHandlerQuote<Q>, ctx: DestHandlerContext): Promise<DestHandlerSteps>;
}
