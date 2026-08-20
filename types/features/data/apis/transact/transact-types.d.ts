import type BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { ChainEntity } from '../../entities/chain';
import type { PlatformEntity } from '../../entities/platform';
import type { TokenEntity, TokenErc20 } from '../../entities/token';
import type { VaultEntity } from '../../entities/vault';
import type { AmmEntitySolidly, AmmEntityUniswapLike, AmmEntityUniswapV2 } from '../../entities/zap';
import type { Step } from '../../reducers/wallet/stepper-types';
import { TransactMode } from '../../reducers/wallet/transact-types';
import type { CrossChainRecoveryParams } from '../../reducers/wallet/transact-types';
import type { BeefyStateFn } from '../../store/types';
import type { CurveTokenOption } from './strategies/curve/types';
import type { ZapStrategyId } from './strategies/strategy-configs';
import type { ChainTransactHelpers, IStrategy, TransactHelpers } from './strategies/IStrategy';
import type { QuoteResponse } from './swap/ISwapProvider';
import type { CCTPBridgeQuote } from './cctp/types';
import type { DestHandlerQuote, SourceHandlerQuote } from './handlers/types';
export type TokenAmount<T extends TokenEntity = TokenEntity> = {
    amount: BigNumber;
    token: T;
};
export type InputTokenAmount<T extends TokenEntity = TokenEntity> = {
    amount: BigNumber;
    token: T;
    max: boolean;
};
export type AllowanceTokenAmount = {
    amount: BigNumber;
    token: TokenErc20;
    spenderAddress: string;
};
export type ZapFeeCharge = {
    token: TokenEntity;
    recipient: string;
    bps: number;
    grossAmount: BigNumber;
    feeAmount: BigNumber;
    netAmount: BigNumber;
};
export type ZapFee = {
    value: number;
    campaign?: {
        original: number;
        description?: string;
        id?: string;
    };
};
export declare function isZapFeeDiscounted(zapFee: ZapFee): zapFee is ZapFee & {
    campaign: NonNullable<ZapFee['campaign']>;
};
export type ZapExtraQuoteResponse = {
    /** additional information added by beefy api */
    extra: {
        fee: ZapFee;
    };
};
export declare enum SelectionOrder {
    /** The deposit token */
    Want = 0,
    /** CLM Vault-to-Vault Zap */
    VaultToVault = 1,
    /** All tokens in the pool e.g. Break LP or CLM */
    AllTokensInPool = 2,
    /** Any token in the LP */
    TokenOfPool = 3,
    /** Any other token not in the LP */
    Other = 4,
    /** Cross-chain tokens (higher latency, shown after same-chain options) */
    CrossChain = 5
}
type BaseOption = {
    /** should be unique over all strategies and token selections */
    id: string;
    vaultId: VaultEntity['id'];
    chainId: ChainEntity['id'];
    /** governs how selections are grouped in the UI, should be consistent for the same deposit input/withdraw output token(s) per chain */
    selectionId: string;
    selectionOrder: SelectionOrder;
    selectionHideIfZeroBalance?: boolean;
    inputs: TokenEntity[];
    wantedOutputs: TokenEntity[];
    async?: boolean;
    feeable?: boolean;
    feeCampaign?: OptionFeeCampaign;
};
export type OptionFeeCampaign = {
    effectiveBps: number;
    baseBps: number;
};
type BaseDepositOption = BaseOption & {
    mode: TransactMode.Deposit;
};
type BaseWithdrawOption = BaseOption & {
    mode: TransactMode.Withdraw;
};
type ZapBaseDepositOption = BaseDepositOption;
type ZapBaseWithdrawOption = BaseWithdrawOption;
export type StandardVaultDepositOption = BaseDepositOption & {
    strategyId: 'vault';
    vaultType: 'standard';
};
export type StandardVaultWithdrawOption = BaseWithdrawOption & {
    strategyId: 'vault';
    vaultType: 'standard';
};
export type GovVaultDepositOption = BaseDepositOption & {
    strategyId: 'vault';
    vaultType: 'gov';
};
export type GovVaultWithdrawOption = BaseWithdrawOption & {
    strategyId: 'vault';
    vaultType: 'gov';
};
export type CowcentratedVaultDepositOption = BaseDepositOption & {
    strategyId: 'vault';
    vaultType: 'cowcentrated';
};
export type CowcentratedVaultWithdrawOption = BaseWithdrawOption & {
    strategyId: 'vault';
    vaultType: 'cowcentrated';
};
export type Erc4626VaultDepositOption = BaseDepositOption & {
    strategyId: 'vault';
    vaultType: 'erc4626';
};
export type Erc4626VaultWithdrawOption = BaseWithdrawOption & {
    strategyId: 'vault';
    vaultType: 'erc4626';
};
export type CowcentratedZapDepositOption = ZapBaseDepositOption & {
    strategyId: 'cowcentrated';
    vaultType: 'cowcentrated';
    swapVia: 'aggregator';
};
export type CowcentratedDualZapDepositOption = ZapBaseDepositOption & {
    strategyId: 'cowcentrated-dual';
    vaultType: 'cowcentrated';
    depositToken: TokenEntity;
    lpTokens: TokenEntity[];
    swapVia: 'aggregator';
};
export type CowcentratedZapWithdrawOption = ZapBaseWithdrawOption & {
    strategyId: 'cowcentrated';
    vaultType: 'cowcentrated';
    swapVia: 'aggregator';
};
export type UniswapLikeDepositOption<TAmm extends AmmEntityUniswapLike> = ZapBaseDepositOption & {
    strategyId: TAmm['type'];
    depositToken: TokenEntity;
    lpTokens: TokenErc20[];
    swapVia: 'pool' | 'aggregator';
};
export type UniswapV2DepositOption = UniswapLikeDepositOption<AmmEntityUniswapV2>;
export type SolidlyDepositOption = UniswapLikeDepositOption<AmmEntitySolidly>;
export type GammaDepositOption = ZapBaseDepositOption & {
    strategyId: 'gamma';
    depositToken: TokenEntity;
    lpTokens: TokenErc20[];
    swapVia: 'aggregator';
};
export type UniswapLikeWithdrawOption<TAmm extends AmmEntityUniswapLike> = ZapBaseWithdrawOption & {
    strategyId: TAmm['type'];
    depositToken: TokenEntity;
    lpTokens: TokenErc20[];
    swapVia?: 'pool' | 'aggregator';
};
export type UniswapV2WithdrawOption = UniswapLikeWithdrawOption<AmmEntityUniswapV2>;
export type SolidlyWithdrawOption = UniswapLikeWithdrawOption<AmmEntitySolidly>;
export type GammaWithdrawOption = ZapBaseWithdrawOption & {
    strategyId: 'gamma';
    depositToken: TokenEntity;
    lpTokens: TokenErc20[];
    swapVia?: 'aggregator' | undefined;
};
export type SingleDepositOption = ZapBaseDepositOption & {
    strategyId: 'single';
};
export type SingleWithdrawOption = ZapBaseWithdrawOption & {
    strategyId: 'single';
};
export type CurveDepositOption = ZapBaseDepositOption & {
    strategyId: 'curve';
} & ({
    via: 'direct';
    viaToken: CurveTokenOption;
} | {
    via: 'aggregator';
    viaTokens: CurveTokenOption[];
});
export type CurveWithdrawOption = ZapBaseWithdrawOption & {
    strategyId: 'curve';
} & ({
    via: 'direct';
    viaToken: CurveTokenOption;
} | {
    via: 'aggregator';
    viaTokens: CurveTokenOption[];
});
export type PendleV2DepositOption = ZapBaseDepositOption & {
    strategyId: 'pendle-v2';
} & ({
    via: 'direct';
    viaToken: TokenEntity;
} | {
    via: 'aggregator';
});
export type PendleV2WithdrawOption = ZapBaseWithdrawOption & {
    strategyId: 'pendle-v2';
} & ({
    via: 'direct';
    viaToken: TokenEntity;
} | {
    via: 'aggregator';
});
export type BalancerOptionSingleDirectPart = {
    type: 'single';
    via: 'direct';
    viaToken: TokenEntity;
};
export type BalancerOptionSingleAggregatorPart = {
    type: 'single';
    via: 'aggregator';
    viaTokens: TokenEntity[];
};
export type BalancerOptionAllAggregatorPart = {
    type: 'all';
    via: 'aggregator';
    viaTokens: TokenEntity[];
};
type BalancerDepositionOptionBase = ZapBaseDepositOption & {
    strategyId: 'balancer';
};
export type BalancerDepositOptionSingleDirect = BalancerDepositionOptionBase & BalancerOptionSingleDirectPart;
export type BalancerDepositOptionSingleAggregator = BalancerDepositionOptionBase & BalancerOptionSingleAggregatorPart;
export type BalancerDepositOptionAllAggregator = BalancerDepositionOptionBase & BalancerOptionAllAggregatorPart;
export type BalancerDepositOption = BalancerDepositionOptionBase & (BalancerOptionSingleDirectPart | BalancerOptionSingleAggregatorPart | BalancerOptionAllAggregatorPart);
type BalancerWithdrawOptionBase = ZapBaseWithdrawOption & {
    strategyId: 'balancer';
};
export type BalancerOptionAllBreakOnlyPart = {
    type: 'all';
    via: 'break-only';
    viaTokens: TokenEntity[];
};
export type BalancerWithdrawOptionSingleDirect = BalancerWithdrawOptionBase & BalancerOptionSingleDirectPart;
export type BalancerWithdrawOptionSingleAggregator = BalancerWithdrawOptionBase & BalancerOptionSingleAggregatorPart;
export type BalancerWithdrawOptionAllAggregator = BalancerWithdrawOptionBase & BalancerOptionAllAggregatorPart;
export type BalancerWithdrawOptionAllBreakOnly = BalancerWithdrawOptionBase & BalancerOptionAllBreakOnlyPart;
export type BalancerWithdrawOption = BalancerWithdrawOptionBase & (BalancerOptionSingleDirectPart | BalancerOptionSingleAggregatorPart | BalancerOptionAllAggregatorPart | BalancerOptionAllBreakOnlyPart);
export type ConicDepositOption = ZapBaseDepositOption & {
    strategyId: 'conic';
};
export type ConicWithdrawOption = ZapBaseWithdrawOption & {
    strategyId: 'conic';
};
export type GovComposerDepositOption = ZapBaseDepositOption & {
    strategyId: 'gov-composer';
    underlyingOption: CowcentratedZapDepositOption | CowcentratedDualZapDepositOption | SingleDepositOption | CowcentratedVaultDepositOption;
};
export type GovComposerWithdrawOption = ZapBaseWithdrawOption & {
    strategyId: 'gov-composer';
    underlyingOption: CowcentratedZapWithdrawOption | SingleWithdrawOption | CowcentratedVaultWithdrawOption;
};
export type VaultComposerDepositOption = ZapBaseDepositOption & {
    strategyId: 'vault-composer';
    underlyingOption: CowcentratedZapDepositOption | CowcentratedDualZapDepositOption | SingleDepositOption | CowcentratedVaultDepositOption;
};
export type VaultComposerWithdrawOption = ZapBaseWithdrawOption & {
    strategyId: 'vault-composer';
    underlyingOption: CowcentratedZapWithdrawOption | SingleWithdrawOption | CowcentratedVaultWithdrawOption;
};
export type RewardPoolToVaultDepositOption = ZapBaseDepositOption & {
    strategyId: 'reward-pool-to-vault';
};
export type RewardPoolToVaultWithdrawOption = ZapBaseWithdrawOption & {
    strategyId: 'reward-pool-to-vault';
};
/** Discriminates source-side behavior for a cross-chain deposit. */
export type CrossChainSrcHandlerKind = 'swap' | 'vault';
/** Discriminates destination-side behavior for a cross-chain withdraw. */
export type CrossChainDestHandlerKind = 'passthrough' | 'swap' | 'vault';
/** Common shape for cross-chain deposit options; variants discriminate on `srcHandlerKind`. */
type CrossChainDepositOptionBase = ZapBaseDepositOption & {
    strategyId: 'cross-chain';
    sourceChainId: ChainEntity['id'];
    destChainId: ChainEntity['id'];
    bridgeToken: TokenEntity;
    destBridgeToken: TokenEntity;
    destHandlerKind: 'vault';
    destVaultId: VaultEntity['id'];
};
/** Swap-src deposit: a user token is swapped to USDC on the src chain. */
export type CrossChainSwapSrcDepositOption = CrossChainDepositOptionBase & {
    srcHandlerKind: 'swap';
};
/** Vault-src deposit: shares of `srcVaultId` are withdrawn to USDC on the src chain. */
export type CrossChainVaultSrcDepositOption = CrossChainDepositOptionBase & {
    srcHandlerKind: 'vault';
    srcVaultId: VaultEntity['id'];
};
/** Deposit option spanning two chains: user provides input on sourceChainId, receives vault tokens on destChainId */
export type CrossChainDepositOption = CrossChainSwapSrcDepositOption | CrossChainVaultSrcDepositOption;
/** Common shape for cross-chain withdraw options; variants discriminate on `destHandlerKind`. */
type CrossChainWithdrawOptionBase = ZapBaseWithdrawOption & {
    strategyId: 'cross-chain';
    sourceChainId: ChainEntity['id'];
    destChainId: ChainEntity['id'];
    bridgeToken: TokenEntity;
    destBridgeToken: TokenEntity;
    srcHandlerKind: 'vault';
    srcVaultId: VaultEntity['id'];
};
/** Passthrough-dst withdraw: USDC is minted directly to the user on the dst chain. */
export type CrossChainPassthroughDstWithdrawOption = CrossChainWithdrawOptionBase & {
    destHandlerKind: 'passthrough';
};
/** Swap-dst withdraw: USDC is swapped to a target token on the dst chain. */
export type CrossChainSwapDstWithdrawOption = CrossChainWithdrawOptionBase & {
    destHandlerKind: 'swap';
};
/** Vault-dst withdraw: USDC is deposited into `destVaultId` on the dst chain. */
export type CrossChainVaultDstWithdrawOption = CrossChainWithdrawOptionBase & {
    destHandlerKind: 'vault';
    destVaultId: VaultEntity['id'];
};
/** Withdrawal option delivering tokens on a different chain than the vault */
export type CrossChainWithdrawOption = CrossChainPassthroughDstWithdrawOption | CrossChainSwapDstWithdrawOption | CrossChainVaultDstWithdrawOption;
/**
 * Same-chain vault-to-vault deposit option: routes user's vault A shares through
 * a routing token into the page vault (B) within a single atomic zap.
 */
export type VaultToVaultSingleTokenDepositOption = ZapBaseDepositOption & {
    strategyId: 'vault-to-vault-single-token';
    /** Source vault — the user's existing position being unwound. */
    srcVaultId: VaultEntity['id'];
    /** Destination vault — always the page vault. */
    destVaultId: VaultEntity['id'];
    /** Token used as the routing handoff between source and destination legs. */
    routingToken: TokenEntity;
};
/**
 * Same-chain vault-to-vault withdraw option: routes the page vault's shares
 * through a routing token into a target vault on the same chain.
 */
export type VaultToVaultSingleTokenWithdrawOption = ZapBaseWithdrawOption & {
    strategyId: 'vault-to-vault-single-token';
    /** Source vault — always the page vault. */
    srcVaultId: VaultEntity['id'];
    /** Destination vault — the user's chosen target. */
    destVaultId: VaultEntity['id'];
    /** Token used as the routing handoff between source and destination legs. */
    routingToken: TokenEntity;
};
export type DepositOption = StandardVaultDepositOption | GovVaultDepositOption | Erc4626VaultDepositOption | CowcentratedVaultDepositOption | SolidlyDepositOption | UniswapV2DepositOption | GammaDepositOption | SingleDepositOption | CurveDepositOption | CowcentratedZapDepositOption | CowcentratedDualZapDepositOption | ConicDepositOption | GovComposerDepositOption | VaultComposerDepositOption | RewardPoolToVaultDepositOption | BalancerDepositOption | PendleV2DepositOption | CrossChainDepositOption | VaultToVaultSingleTokenDepositOption;
export type WithdrawOption = StandardVaultWithdrawOption | GovVaultWithdrawOption | Erc4626VaultWithdrawOption | CowcentratedVaultWithdrawOption | SolidlyWithdrawOption | UniswapV2WithdrawOption | GammaWithdrawOption | SingleWithdrawOption | CurveWithdrawOption | CowcentratedZapWithdrawOption | ConicWithdrawOption | GovComposerWithdrawOption | VaultComposerWithdrawOption | RewardPoolToVaultWithdrawOption | BalancerWithdrawOption | PendleV2WithdrawOption | CrossChainWithdrawOption | VaultToVaultSingleTokenWithdrawOption;
export type TransactOption = DepositOption | WithdrawOption;
export declare function isDepositOption(option: TransactOption): option is DepositOption;
export declare function isWithdrawOption(option: TransactOption): option is WithdrawOption;
export declare function isCrossChainDepositOption(option: TransactOption): option is CrossChainDepositOption;
export declare function isCrossChainWithdrawOption(option: TransactOption): option is CrossChainWithdrawOption;
export declare function isCrossChainOption(option: TransactOption): option is CrossChainDepositOption | CrossChainWithdrawOption;
export declare function isCrossChainVaultSrcDepositOption(option: TransactOption): option is CrossChainVaultSrcDepositOption;
export declare function isCrossChainVaultDstWithdrawOption(option: TransactOption): option is CrossChainVaultDstWithdrawOption;
export declare function isVaultToVaultSingleTokenDepositOption(option: TransactOption): option is VaultToVaultSingleTokenDepositOption;
export declare function isVaultToVaultSingleTokenWithdrawOption(option: TransactOption): option is VaultToVaultSingleTokenWithdrawOption;
export declare function isVaultToVaultSingleTokenOption(option: TransactOption): option is VaultToVaultSingleTokenDepositOption | VaultToVaultSingleTokenWithdrawOption;
export type VaultSourceDepositOption = CrossChainVaultSrcDepositOption | VaultToVaultSingleTokenDepositOption;
export type VaultDestWithdrawOption = CrossChainVaultDstWithdrawOption | VaultToVaultSingleTokenWithdrawOption;
export declare function isVaultSourceDepositOption(option: TransactOption): option is VaultSourceDepositOption;
export declare function isVaultDestWithdrawOption(option: TransactOption): option is VaultDestWithdrawOption;
export type CrossChainTokenOption = {
    token: TokenEntity;
    balanceUsd: BigNumber;
};
export type CrossChainChainOption = {
    chainId: ChainEntity['id'];
    chainName: string;
    balanceUsd: BigNumber;
    tokens: CrossChainTokenOption[];
};
export type BaseZapQuoteStepSwap = {
    type: 'swap';
    fromToken: TokenEntity;
    fromAmount: BigNumber;
    toToken: TokenEntity;
    toAmount: BigNumber;
};
export type ZapQuoteStepSwapAggregator = BaseZapQuoteStepSwap & {
    via: 'aggregator';
    /** providerId of swap aggregator */
    providerId: string;
    fee: ZapFee;
    quote: QuoteResponse;
};
export type ZapQuoteStepSwapPool = BaseZapQuoteStepSwap & {
    via: 'pool';
    /** providerId (tokenProviderId) of the token */
    providerId: string;
};
export type ZapQuoteStepSwap = ZapQuoteStepSwapAggregator | ZapQuoteStepSwapPool;
export type ZapQuoteStepBuild = {
    type: 'build';
    inputs: TokenAmount[];
    outputToken: TokenEntity;
    outputAmount: BigNumber;
    providerId?: PlatformEntity['id'];
};
export type ZapQuoteStepWithdraw = {
    type: 'withdraw';
    outputs: TokenAmount[];
};
export type ZapQuoteStepDeposit = {
    type: 'deposit';
    inputs: TokenAmount[];
};
export type ZapQuoteStepSplit = {
    type: 'split';
    outputs: TokenAmount[];
    inputToken: TokenEntity;
    inputAmount: BigNumber;
};
export type ZapQuoteStepUnused = {
    type: 'unused';
    outputs: TokenAmount[];
};
export type ZapQuoteStepStake = {
    type: 'stake';
    inputs: TokenAmount[];
};
export type ZapQuoteStepUnstake = {
    type: 'unstake';
    outputs: TokenAmount[];
};
export type ZapQuoteStepBridge = {
    type: 'bridge';
    bridgeId: 'cctp';
    fromChainId: ChainEntity['id'];
    toChainId: ChainEntity['id'];
    fromToken: TokenEntity;
    toToken: TokenEntity;
    fromAmount: BigNumber;
    toAmount: BigNumber;
    timeEstimate: number;
};
export type ZapQuoteStepFee = ZapFeeCharge & {
    type: 'fee';
    originalBps?: number;
};
export type ZapQuoteStep = ZapQuoteStepWithdraw | ZapQuoteStepSwap | ZapQuoteStepBuild | ZapQuoteStepDeposit | ZapQuoteStepSplit | ZapQuoteStepUnused | ZapQuoteStepStake | ZapQuoteStepUnstake | ZapQuoteStepBridge | ZapQuoteStepFee;
export declare function isZapQuoteStepSwap(step: ZapQuoteStep): step is ZapQuoteStepSwap;
export declare function isZapQuoteStepWithdraw(step: ZapQuoteStep): step is ZapQuoteStepSwap;
export declare function isZapQuoteStepDeposit(step: ZapQuoteStep): step is ZapQuoteStepDeposit;
export declare function isZapQuoteStepBuild(step: ZapQuoteStep): step is ZapQuoteStepBuild;
export declare function isZapQuoteStepSplit(step: ZapQuoteStep): step is ZapQuoteStepSplit;
export declare function isZapQuoteStepStake(step: ZapQuoteStep): step is ZapQuoteStepStake;
export declare function isZapQuoteStepUnstake(step: ZapQuoteStep): step is ZapQuoteStepUnstake;
export declare function isZapQuoteStepBridge(step: ZapQuoteStep): step is ZapQuoteStepBridge;
export declare function isZapQuoteStepFee(step: ZapQuoteStep): step is ZapQuoteStepFee;
export declare function isZapQuoteStepSwapPool(step: ZapQuoteStepSwap): step is ZapQuoteStepSwapPool;
export declare function isZapQuoteStepSwapAggregator(step: ZapQuoteStepSwap): step is ZapQuoteStepSwapAggregator;
type BaseQuote<T extends TransactOption> = {
    id: string;
    strategyId: T['strategyId'];
    priceImpact: number;
    allowances: AllowanceTokenAmount[];
    inputs: InputTokenAmount[];
    outputs: TokenAmount[];
    returned: TokenAmount[];
    option: T;
};
type BaseZapQuote<T extends TransactOption> = BaseQuote<T> & {
    fee: ZapFee;
    steps: ZapQuoteStep[];
};
/** Quote for recovery of the destination portion of a cross-chain zap. */
export type RecoveryQuote = {
    id: string;
    inputs: InputTokenAmount[];
    outputs: TokenAmount[];
    returned: TokenAmount[];
    steps: ZapQuoteStep[];
    priceImpact: number;
    fee: ZapFee;
    allowances: AllowanceTokenAmount[];
    /**
     * Captured at quote time, reused at step time so fetchZapSteps runs against the same route.
     * NOT serializable (BigNumber etc.) — do not persist or structuredClone.
     */
    destHandlerQuote: DestHandlerQuote;
};
export type StandardVaultDepositQuote = BaseQuote<StandardVaultDepositOption> & {
    vaultType: 'standard';
};
export type GovVaultDepositQuote = BaseQuote<GovVaultDepositOption> & {
    vaultType: 'gov';
};
export type Erc4626VaultDepositQuote = BaseQuote<Erc4626VaultDepositOption> & {
    vaultType: 'erc4626';
};
export type CowcentratedVaultDepositQuote = BaseQuote<CowcentratedVaultDepositOption> & {
    vaultType: 'cowcentrated';
    isCalm: boolean;
    used: TokenAmount[];
    unused: TokenAmount[];
    position: TokenAmount[];
};
export type CowcentratedZapDepositQuote = BaseZapQuote<CowcentratedZapDepositOption> & {
    vaultType: 'cowcentrated';
    isCalm: boolean;
    used: TokenAmount[];
    unused: TokenAmount[];
    position: TokenAmount[];
    lpQuotes: (QuoteResponse | undefined)[];
};
export type CowcentratedDualZapDepositQuote = BaseZapQuote<CowcentratedDualZapDepositOption> & {
    vaultType: 'cowcentrated';
    isCalm: boolean;
    used: TokenAmount[];
    unused: TokenAmount[];
    position: TokenAmount[];
    lpQuotes: (QuoteResponse | undefined)[];
};
export type GovComposerZapDepositQuote = BaseZapQuote<GovComposerDepositOption> & {
    vaultType: 'gov';
    underlyingQuote: CowcentratedZapDepositQuote | CowcentratedDualZapDepositQuote | SingleDepositQuote | CowcentratedVaultDepositQuote;
    subStrategy: 'strategy' | 'vault';
};
export type VaultComposerZapDepositQuote = BaseZapQuote<VaultComposerDepositOption> & {
    vaultType: 'standard';
    underlyingQuote: CowcentratedZapDepositQuote | CowcentratedDualZapDepositQuote | SingleDepositQuote | CowcentratedVaultDepositQuote;
    subStrategy: 'strategy' | 'vault';
};
export type SingleDepositQuote = BaseZapQuote<SingleDepositOption> & {
    swapQuote?: QuoteResponse;
};
export type UniswapLikePoolDepositQuote<T extends UniswapLikeDepositOption<AmmEntityUniswapLike>> = BaseZapQuote<T> & {
    quote: {
        from: TokenAmount;
        to: TokenAmount;
    };
};
export type UniswapLikeAggregatorDepositQuote<T extends UniswapLikeDepositOption<AmmEntityUniswapLike>> = BaseZapQuote<T> & {
    lpQuotes: (QuoteResponse | undefined)[];
};
export type UniswapLikeDepositQuote<T extends UniswapLikeDepositOption<AmmEntityUniswapLike>> = UniswapLikePoolDepositQuote<T> | UniswapLikeAggregatorDepositQuote<T>;
export type UniswapV2DepositQuote = UniswapLikeDepositQuote<UniswapV2DepositOption>;
export type SolidlyDepositQuote = UniswapLikeDepositQuote<SolidlyDepositOption>;
export type CurveDepositQuote = BaseZapQuote<CurveDepositOption> & {
    via: 'aggregator' | 'direct';
    viaToken: CurveTokenOption;
};
export type BalancerDepositQuote = BaseZapQuote<BalancerDepositOption>;
export type PendleV2DepositQuote = BaseZapQuote<PendleV2DepositOption> & {
    via: 'aggregator' | 'direct';
    viaToken: TokenEntity;
};
export type GammaDepositQuote = BaseZapQuote<GammaDepositOption> & {
    lpQuotes: (QuoteResponse | undefined)[];
};
export type RewardPoolToVaultDepositQuote = BaseZapQuote<RewardPoolToVaultDepositOption>;
export type ConicDepositQuote = BaseZapQuote<ConicDepositOption>;
/** Quote for a cross-chain deposit: source swap → bridge → dest swap + deposit */
export type CrossChainDepositQuote = BaseZapQuote<CrossChainDepositOption> & {
    srcHandlerKind: CrossChainSrcHandlerKind;
    destHandlerKind: 'vault';
    sourceSteps: ZapQuoteStep[];
    destSteps: ZapQuoteStep[];
    bridgeQuote: CCTPBridgeQuote;
    srcHandlerQuote: SourceHandlerQuote;
    destHandlerQuote: DestHandlerQuote;
};
export type VaultDepositQuote = StandardVaultDepositQuote | GovVaultDepositQuote | CowcentratedVaultDepositQuote | Erc4626VaultDepositQuote;
/** Quote for a same-chain vault-to-vault deposit: src vault withdraw → intermediary → page vault deposit. */
export type VaultToVaultSingleTokenDepositQuote = BaseZapQuote<VaultToVaultSingleTokenDepositOption> & {
    sourceSteps: ZapQuoteStep[];
    destSteps: ZapQuoteStep[];
    srcHandlerQuote: SourceHandlerQuote;
    destHandlerQuote: DestHandlerQuote;
};
export type ZapDepositQuote = SingleDepositQuote | UniswapV2DepositQuote | SolidlyDepositQuote | CurveDepositQuote | GammaDepositQuote | ConicDepositQuote | CowcentratedZapDepositQuote | CowcentratedDualZapDepositQuote | GovComposerZapDepositQuote | VaultComposerZapDepositQuote | RewardPoolToVaultDepositQuote | BalancerDepositQuote | PendleV2DepositQuote | CrossChainDepositQuote | VaultToVaultSingleTokenDepositQuote;
export type DepositQuote = VaultDepositQuote | ZapDepositQuote;
export type StandardVaultWithdrawQuote = BaseQuote<StandardVaultWithdrawOption> & {
    vaultType: 'standard';
};
export type GovVaultWithdrawQuote = BaseQuote<GovVaultWithdrawOption> & {
    vaultType: 'gov';
};
export type Erc4626VaultWithdrawQuote = BaseQuote<Erc4626VaultWithdrawOption> & {
    vaultType: 'erc4626';
};
export type CowcentratedVaultWithdrawQuote = BaseQuote<CowcentratedVaultWithdrawOption> & {
    vaultType: 'cowcentrated';
    isCalm: boolean;
};
export type CowcentratedZapWithdrawQuote = BaseZapQuote<CowcentratedZapWithdrawOption> & {
    vaultType: 'cowcentrated';
    isCalm: boolean;
};
export type SingleWithdrawQuote = BaseZapQuote<SingleWithdrawOption>;
export type UniswapLikeBreakWithdrawQuote<T extends UniswapLikeWithdrawOption<AmmEntityUniswapLike>> = BaseZapQuote<T>;
export type UniswapLikePoolWithdrawQuote<T extends UniswapLikeWithdrawOption<AmmEntityUniswapLike>> = BaseZapQuote<T> & {
    quote: {
        from: TokenAmount;
        to: TokenAmount;
    };
};
export type UniswapLikeAggregatorWithdrawQuote<T extends UniswapLikeWithdrawOption<AmmEntityUniswapLike>> = BaseZapQuote<T> & {
    lpQuotes: QuoteResponse[];
};
export type UniswapLikeWithdrawQuote<T extends UniswapLikeWithdrawOption<AmmEntityUniswapLike>> = UniswapLikeBreakWithdrawQuote<T> | UniswapLikePoolWithdrawQuote<T> | UniswapLikeAggregatorWithdrawQuote<T>;
export type UniswapV2WithdrawQuote = UniswapLikeWithdrawQuote<UniswapV2WithdrawOption>;
export type SolidlyWithdrawQuote = UniswapLikeWithdrawQuote<SolidlyWithdrawOption>;
export type CurveWithdrawQuote = BaseZapQuote<CurveWithdrawOption> & {
    via: 'aggregator' | 'direct';
    viaToken: CurveTokenOption;
};
export type BalancerWithdrawQuoteSingle = BaseZapQuote<BalancerWithdrawOptionSingleDirect | BalancerWithdrawOptionSingleAggregator> & {
    type: 'single';
    viaToken: TokenEntity;
};
export type BalancerWithdrawQuoteAll = BaseZapQuote<BalancerWithdrawOptionAllAggregator | BalancerWithdrawOptionAllBreakOnly> & {
    type: 'all';
};
export type BalancerWithdrawQuote = BalancerWithdrawQuoteSingle | BalancerWithdrawQuoteAll;
export type PendleV2WithdrawQuote = BaseZapQuote<PendleV2WithdrawOption> & {
    via: 'aggregator' | 'direct';
    viaToken: TokenEntity;
};
export type GammaBreakWithdrawQuote = BaseZapQuote<GammaWithdrawOption>;
export type GammaAggregatorWithdrawQuote = BaseZapQuote<GammaWithdrawOption> & {
    lpQuotes: QuoteResponse[];
};
export type GammaWithdrawQuote = GammaBreakWithdrawQuote | GammaAggregatorWithdrawQuote;
export type VaultWithdrawQuote = StandardVaultWithdrawQuote | GovVaultWithdrawQuote | CowcentratedVaultWithdrawQuote | Erc4626VaultWithdrawQuote;
export type ConicWithdrawQuote = BaseZapQuote<ConicWithdrawOption>;
export type GovComposerZapWithdrawQuote = BaseZapQuote<GovComposerWithdrawOption> & {
    vaultType: 'gov';
    underlyingQuote: CowcentratedZapWithdrawQuote | SingleWithdrawQuote | CowcentratedVaultWithdrawQuote;
    subStrategy: 'strategy' | 'vault';
};
export type VaultComposerZapWithdrawQuote = BaseZapQuote<VaultComposerWithdrawOption> & {
    vaultType: 'standard';
    underlyingQuote: CowcentratedZapWithdrawQuote | SingleWithdrawQuote | CowcentratedVaultWithdrawQuote;
    subStrategy: 'strategy' | 'vault';
};
/** Quote for a cross-chain withdrawal: vault withdraw → swap to USDC → bridge → optional dest swap */
export type CrossChainWithdrawQuote = BaseZapQuote<CrossChainWithdrawOption> & {
    srcHandlerKind: 'vault';
    destHandlerKind: CrossChainDestHandlerKind;
    sourceSteps: ZapQuoteStep[];
    destSteps: ZapQuoteStep[];
    bridgeQuote: CCTPBridgeQuote;
    srcHandlerQuote: SourceHandlerQuote;
    destHandlerQuote: DestHandlerQuote;
};
/** Quote for a same-chain vault-to-vault withdraw: page vault withdraw → intermediary → dst vault deposit. */
export type VaultToVaultSingleTokenWithdrawQuote = BaseZapQuote<VaultToVaultSingleTokenWithdrawOption> & {
    sourceSteps: ZapQuoteStep[];
    destSteps: ZapQuoteStep[];
    srcHandlerQuote: SourceHandlerQuote;
    destHandlerQuote: DestHandlerQuote;
};
export type ZapWithdrawQuote = SingleWithdrawQuote | UniswapV2WithdrawQuote | SolidlyWithdrawQuote | CurveWithdrawQuote | GammaWithdrawQuote | ConicWithdrawQuote | CowcentratedZapWithdrawQuote | GovComposerZapWithdrawQuote | VaultComposerZapWithdrawQuote | BalancerWithdrawQuote | PendleV2WithdrawQuote | CrossChainWithdrawQuote | VaultToVaultSingleTokenWithdrawQuote;
export type WithdrawQuote = VaultWithdrawQuote | ZapWithdrawQuote;
export type ZapQuote = ZapDepositQuote | ZapWithdrawQuote;
export type TransactQuote = DepositQuote | WithdrawQuote;
export declare function isCrossChainDepositQuote(quote: TransactQuote): quote is CrossChainDepositQuote;
export declare function isVaultToVaultSingleTokenDepositQuote(quote: TransactQuote): quote is VaultToVaultSingleTokenDepositQuote;
export declare function isCrossChainWithdrawQuote(quote: TransactQuote): quote is CrossChainWithdrawQuote;
export declare function isCrossChainQuote(quote: TransactQuote): quote is CrossChainDepositQuote | CrossChainWithdrawQuote;
export declare function isAsyncQuote(quote: TransactQuote): boolean;
export type ZapStrategyIdToDepositOption<T extends ZapStrategyId> = Extract<DepositOption, {
    strategyId: T;
}>;
export type ZapStrategyIdToWithdrawOption<T extends ZapStrategyId> = Extract<WithdrawOption, {
    strategyId: T;
}>;
export type ZapStrategyIdToDepositQuote<T extends ZapStrategyId> = Extract<ZapDepositQuote, {
    strategyId: T;
}>;
export type ZapStrategyIdToWithdrawQuote<T extends ZapStrategyId> = Extract<ZapWithdrawQuote, {
    strategyId: T;
}>;
export type QuoteOutputTokenAmountChange = TokenAmount & {
    newAmount: TokenAmount['amount'];
    difference: TokenAmount['amount'];
};
export declare function isZapQuote(quote: TransactQuote): quote is ZapQuote;
export declare function isZapOption(option: TransactOption): boolean;
export declare function isCowcentratedVaultDepositQuote(quote: TransactQuote): quote is CowcentratedVaultDepositQuote;
export declare function isCowcentratedZapDepositQuote(quote: TransactQuote): quote is CowcentratedZapDepositQuote | CowcentratedDualZapDepositQuote;
export declare function isCowcentratedDepositQuote(quote: TransactQuote): quote is CowcentratedVaultDepositQuote | CowcentratedZapDepositQuote | CowcentratedDualZapDepositQuote;
export declare function isCowcentratedVaultWithdrawQuote(quote: TransactQuote): quote is CowcentratedVaultWithdrawQuote;
export declare function isCowcentratedZapWithdrawQuote(quote: TransactQuote): quote is CowcentratedVaultWithdrawQuote;
export declare function isCowcentratedWithdrawQuote(quote: TransactQuote): quote is CowcentratedVaultWithdrawQuote | CowcentratedZapWithdrawQuote;
export declare function isVaultWithdrawQuote(quote: TransactQuote): quote is VaultWithdrawQuote;
export declare function isGovVaultWithdrawQuote(quote: TransactQuote): quote is GovVaultWithdrawQuote;
export declare function isGovUnderlyingCowcentratedDepositQuote(quote: TransactQuote): quote is GovComposerZapDepositQuote;
export declare function isVaultUnderlyingCowcentratedDepositQuote(quote: TransactQuote): quote is VaultComposerZapDepositQuote;
export declare function isGovUnderlyingCowcentratedWithdrawQuote(quote: TransactQuote): quote is GovComposerZapWithdrawQuote;
export declare function isVaultUnderlyingCowcentratedWithdrawQuote(quote: TransactQuote): quote is VaultComposerZapWithdrawQuote;
export declare function isGovComposerWithdrawQuote(quote: TransactQuote): quote is GovComposerZapWithdrawQuote;
export declare function isDepositQuote(quote: TransactQuote): quote is DepositQuote;
export declare function isWithdrawQuote(quote: TransactQuote): quote is WithdrawQuote;
export declare function quoteNeedsSlippage(quote: TransactQuote): boolean;
export interface ITransactApi {
    fetchDepositOptionsFor(vaultId: VaultEntity['id'], getState: BeefyStateFn): Promise<DepositOption[]>;
    fetchDepositQuotesFor(options: DepositOption[], inputs: InputTokenAmount[], getState: BeefyStateFn): Promise<DepositQuote[]>;
    fetchDepositStep(quote: DepositQuote, getState: BeefyStateFn, t: TFunction<Namespace>): Promise<Step>;
    fetchWithdrawOptionsFor(vaultId: VaultEntity['id'], getState: BeefyStateFn): Promise<WithdrawOption[]>;
    fetchWithdrawQuotesFor(options: WithdrawOption[], inputs: InputTokenAmount[], getState: BeefyStateFn): Promise<WithdrawQuote[]>;
    fetchWithdrawStep(quote: WithdrawQuote, getState: BeefyStateFn, t: TFunction<Namespace>): Promise<Step>;
    fetchVaultHasZap(vaultId: VaultEntity['id'], getState: BeefyStateFn): Promise<boolean>;
    getHelpersForChain(chainId: ChainEntity['id'], getState: BeefyStateFn): Promise<ChainTransactHelpers>;
    getHelpersForVault(vaultId: VaultEntity['id'], getState: BeefyStateFn): Promise<TransactHelpers>;
    getZapStrategiesForVault(helpers: TransactHelpers): Promise<IStrategy[]>;
    fetchRecoveryQuote(recovery: CrossChainRecoveryParams, actualBridgedAmount: BigNumber, getState: BeefyStateFn, pageVaultId: VaultEntity['id']): Promise<RecoveryQuote>;
    fetchRecoveryStep(recovery: CrossChainRecoveryParams, quote: RecoveryQuote, opId: string, getState: BeefyStateFn, t: TFunction<Namespace>, pageVaultId: VaultEntity['id']): Promise<Step>;
}
export {};
