import type { VaultEntity } from '../../entities/vault';
import type { GetStateFn } from '../../../../redux-types';
import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../entities/chain';
import type { TokenEntity, TokenErc20 } from '../../entities/token';
import type { Step } from '../../reducers/wallet/stepper';
import type { Namespace, TFunction } from 'react-i18next';
import { TransactMode } from '../../reducers/wallet/transact-types';
import type { QuoteResponse } from './swap/ISwapProvider';
import type {
  AmmEntity,
  AmmEntitySolidly,
  AmmEntityUniswapLike,
  AmmEntityUniswapV2,
} from '../../entities/zap';
import type { PlatformEntity } from '../../entities/platform';
import type { CurveTokenOption } from './strategies/curve/types';

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

export type TokenIndex<T extends TokenEntity = TokenEntity> = {
  token: T;
  index: number;
};

export type ZapFeeNormal = {
  /** 0.0005 = 0.05% */
  value: number;
  recipient?: string;
};
export type ZapFeeDiscounted = ZapFeeNormal & {
  original: number;
};
export type ZapFee = ZapFeeNormal | ZapFeeDiscounted;

export function isZapFeeDiscounted(zapFee: ZapFee): zapFee is ZapFeeDiscounted {
  return 'original' in zapFee;
}

export function isZapFeeNonZero(zapFee: ZapFee): boolean {
  return zapFee.value > 0;
}

//
// Options
//

type BaseOption = {
  /** should be unique over all strategies and token selections */
  id: string;
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  /** governs how selections are grouped in the UI, should be consistent for the same deposit input/withdraw output token(s) per chain */
  selectionId: string;
  selectionOrder: number;
  inputs: TokenEntity[];
  wantedOutputs: TokenEntity[];
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

export type CowcentratedDepositOption = BaseDepositOption & {
  strategyId: 'cowcentrated';
  vaultType: 'cowcentrated';
};

export type CowcentratedWithdrawOption = BaseWithdrawOption & {
  strategyId: 'cowcentrated';
  vaultType: 'cowcentrated';
};

export type UniswapLikeDepositOption<TAmm extends AmmEntity> = ZapBaseDepositOption & {
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

export type UniswapLikeWithdrawOption<TAmm extends AmmEntity> = ZapBaseWithdrawOption & {
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
} & (
    | { via: 'direct'; viaToken: CurveTokenOption }
    | { via: 'aggregator'; viaTokens: CurveTokenOption[] }
  );

export type CurveWithdrawOption = ZapBaseWithdrawOption & {
  strategyId: 'curve';
} & (
    | { via: 'direct'; viaToken: CurveTokenOption }
    | { via: 'aggregator'; viaTokens: CurveTokenOption[] }
  );

export type ConicDepositOption = ZapBaseDepositOption & {
  strategyId: 'conic';
};

export type ConicWithdrawOption = ZapBaseWithdrawOption & {
  strategyId: 'conic';
};

export type DepositOption =
  | StandardVaultDepositOption
  | GovVaultDepositOption
  | SolidlyDepositOption
  | UniswapV2DepositOption
  | GammaDepositOption
  | SingleDepositOption
  | CurveDepositOption
  | CowcentratedDepositOption
  | ConicDepositOption;

export type WithdrawOption =
  | StandardVaultWithdrawOption
  | GovVaultWithdrawOption
  | SolidlyWithdrawOption
  | UniswapV2WithdrawOption
  | GammaWithdrawOption
  | SingleWithdrawOption
  | CurveWithdrawOption
  | CowcentratedWithdrawOption
  | ConicWithdrawOption;

export type TransactOption = DepositOption | WithdrawOption;

export function isDepositOption(option: TransactOption): option is DepositOption {
  return option.mode === TransactMode.Deposit;
}

export function isWithdrawOption(option: TransactOption): option is WithdrawOption {
  return option.mode === TransactMode.Withdraw;
}

//
// Quotes
//

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
  token: TokenEntity;
  amount: BigNumber;
};

export type ZapQuoteStepDeposit = {
  type: 'deposit';
  token: TokenEntity;
  amount: BigNumber;
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

export type ZapQuoteStep =
  | ZapQuoteStepWithdraw
  | ZapQuoteStepSwap
  | ZapQuoteStepBuild
  | ZapQuoteStepDeposit
  | ZapQuoteStepSplit
  | ZapQuoteStepUnused;

export function isZapQuoteStepSwap(step: ZapQuoteStep): step is ZapQuoteStepSwap {
  return step.type === 'swap';
}

export function isZapQuoteStepWithdraw(step: ZapQuoteStep): step is ZapQuoteStepSwap {
  return step.type === 'withdraw';
}

export function isZapQuoteStepBuild(step: ZapQuoteStep): step is ZapQuoteStepBuild {
  return step.type === 'build';
}

export function isZapQuoteStepSplit(step: ZapQuoteStep): step is ZapQuoteStepSplit {
  return step.type === 'split';
}

export function isZapQuoteStepSwapPool(step: ZapQuoteStepSwap): step is ZapQuoteStepSwapPool {
  return step.via === 'pool';
}

export function isZapQuoteStepSwapAggregator(
  step: ZapQuoteStepSwap
): step is ZapQuoteStepSwapAggregator {
  return step.via === 'aggregator';
}

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

export type StandardVaultDepositQuote = BaseQuote<StandardVaultDepositOption> & {
  vaultType: 'standard';
};

export type GovVaultDepositQuote = BaseQuote<GovVaultDepositOption> & {
  vaultType: 'gov';
};

export type CowcentratedVaultDepositQuote = BaseQuote<CowcentratedDepositOption> & {
  vaultType: 'cowcentrated';
  amountsUsed: TokenAmount[];
  amountsReturned: TokenAmount[];
};

export type SingleDepositQuote = BaseZapQuote<SingleDepositOption> & {
  swapQuote: QuoteResponse;
};

export type UniswapLikePoolDepositQuote = BaseZapQuote<
  UniswapLikeDepositOption<AmmEntityUniswapLike>
> & {
  quote: { from: TokenAmount; to: TokenAmount };
};

export type UniswapLikeAggregatorDepositQuote = BaseZapQuote<
  UniswapLikeDepositOption<AmmEntityUniswapLike>
> & {
  lpQuotes: (QuoteResponse | undefined)[];
};

export type UniswapLikeDepositQuote =
  | UniswapLikePoolDepositQuote
  | UniswapLikeAggregatorDepositQuote;

export type UniswapV2PoolDepositQuote = BaseZapQuote<UniswapV2DepositOption> & {
  quote: { from: TokenAmount; to: TokenAmount };
};
export type UniswapV2AggregatorDepositQuote = BaseZapQuote<UniswapV2DepositOption> & {
  lpQuotes: QuoteResponse[];
};
export type UniswapV2DepositQuote = UniswapLikeDepositQuote;
export type SolidlyDepositQuote = UniswapLikeDepositQuote;

export type CurveDepositQuote = BaseZapQuote<CurveDepositOption> & {
  via: 'aggregator' | 'direct';
  viaToken: CurveTokenOption;
};

export type GammaDepositQuote = BaseZapQuote<GammaDepositOption> & {
  lpQuotes: (QuoteResponse | undefined)[];
};

export type ConicDepositQuote = BaseZapQuote<ConicDepositOption>;

export type VaultDepositQuote =
  | StandardVaultDepositQuote
  | GovVaultDepositQuote
  | CowcentratedVaultDepositQuote;

export type ZapDepositQuote =
  | SingleDepositQuote
  | UniswapV2DepositQuote
  | SolidlyDepositQuote
  | CurveDepositQuote
  | GammaDepositQuote
  | ConicDepositQuote;

export type DepositQuote = VaultDepositQuote | ZapDepositQuote;

export type StandardVaultWithdrawQuote = BaseQuote<StandardVaultWithdrawOption> & {
  vaultType: 'standard';
};

export type GovVaultWithdrawQuote = BaseQuote<GovVaultWithdrawOption> & {
  vaultType: 'gov';
};

export type CowcentratedVaultWithdrawQuote = BaseQuote<CowcentratedWithdrawOption> & {
  vaultType: 'cowcentrated';
};

export type SingleWithdrawQuote = BaseZapQuote<SingleWithdrawOption>;

export type UniswapLikeBreakWithdrawQuote = BaseZapQuote<
  UniswapLikeWithdrawOption<AmmEntityUniswapLike>
>;
export type UniswapLikePoolWithdrawQuote = BaseZapQuote<
  UniswapLikeWithdrawOption<AmmEntityUniswapLike>
> & {
  quote: { from: TokenAmount; to: TokenAmount };
};
export type UniswapLikeAggregatorWithdrawQuote = BaseZapQuote<
  UniswapLikeWithdrawOption<AmmEntityUniswapLike>
> & {
  lpQuotes: QuoteResponse[];
};
export type UniswapLikeWithdrawQuote =
  | UniswapLikeBreakWithdrawQuote
  | UniswapLikePoolWithdrawQuote
  | UniswapLikeAggregatorWithdrawQuote;

export type UniswapV2WithdrawQuote = UniswapLikeWithdrawQuote;
export type SolidlyWithdrawQuote = UniswapLikeWithdrawQuote;

export type CurveWithdrawQuote = BaseZapQuote<CurveWithdrawOption> & {
  via: 'aggregator' | 'direct';
  viaToken: CurveTokenOption;
};

export type GammaBreakWithdrawQuote = BaseZapQuote<GammaWithdrawOption>;
export type GammaAggregatorWithdrawQuote = BaseZapQuote<GammaWithdrawOption> & {
  lpQuotes: QuoteResponse[];
};
export type GammaWithdrawQuote = GammaBreakWithdrawQuote | GammaAggregatorWithdrawQuote;

export type VaultWithdrawQuote =
  | StandardVaultWithdrawQuote
  | GovVaultWithdrawQuote
  | CowcentratedVaultWithdrawQuote;

export type ConicWithdrawQuote = BaseZapQuote<ConicWithdrawOption>;

export type ZapWithdrawQuote =
  | SingleWithdrawQuote
  | UniswapV2WithdrawQuote
  | SolidlyWithdrawQuote
  | CurveWithdrawQuote
  | GammaWithdrawQuote
  | ConicWithdrawQuote;

export type WithdrawQuote = VaultWithdrawQuote | ZapWithdrawQuote;

export type ZapQuote = ZapDepositQuote | ZapWithdrawQuote;

export type TransactQuote = DepositQuote | WithdrawQuote;

export type QuoteOutputTokenAmountChange = TokenAmount & {
  newAmount: TokenAmount['amount'];
  difference: TokenAmount['amount'];
};

export function isZapQuote(quote: TransactQuote): quote is ZapQuote {
  return 'steps' in quote;
}

export function isCowcentratedDepositQuote(
  quote: TransactQuote
): quote is CowcentratedVaultDepositQuote {
  return isDepositQuote(quote) && quote.strategyId === 'cowcentrated' && 'amountsUsed' in quote;
}

export function isVaultWithdrawQuote(quote: TransactQuote): quote is VaultWithdrawQuote {
  return isWithdrawQuote(quote) && quote.strategyId === 'vault';
}

export function isGovVaultWithdrawQuote(quote: TransactQuote): quote is GovVaultWithdrawQuote {
  return isVaultWithdrawQuote(quote) && quote.vaultType === 'gov';
}

export function isDepositQuote(quote: TransactQuote): quote is DepositQuote {
  return quote.option.mode === TransactMode.Deposit;
}

export function isWithdrawQuote(quote: TransactQuote): quote is WithdrawQuote {
  return quote.option.mode === TransactMode.Withdraw;
}

export interface ITransactApi {
  fetchDepositOptionsFor(
    vaultId: VaultEntity['id'],
    getState: GetStateFn
  ): Promise<DepositOption[]>;

  fetchDepositQuotesFor(
    options: DepositOption[],
    inputs: InputTokenAmount[],
    getState: GetStateFn
  ): Promise<DepositQuote[]>;

  fetchDepositStep(
    quote: DepositQuote,
    getState: GetStateFn,
    t: TFunction<Namespace>
  ): Promise<Step>;

  fetchWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    getState: GetStateFn
  ): Promise<WithdrawOption[]>;

  fetchWithdrawQuotesFor(
    options: WithdrawOption[],
    inputs: InputTokenAmount[],
    getState: GetStateFn
  ): Promise<WithdrawQuote[]>;

  fetchWithdrawStep(
    quote: WithdrawQuote,
    getState: GetStateFn,
    t: TFunction<Namespace>
  ): Promise<Step>;

  fetchVaultHasZap(vaultId: VaultEntity['id'], getState: GetStateFn): Promise<boolean>;
}
