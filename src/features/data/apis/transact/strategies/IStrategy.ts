import type {
  DepositOption,
  DepositQuote,
  InputTokenAmount,
  TransactQuote,
  WithdrawOption,
  WithdrawQuote,
} from '../transact-types';
import type { VaultTypeFromVault } from '../vaults/IVaultType';
import type { ISwapAggregator } from '../swap/ISwapAggregator';
import type { VaultEntity } from '../../../entities/vault';
import type { BeefyState } from '../../../../../redux-types';
import type {
  AmmEntity,
  AmmEntityGamma,
  AmmEntitySolidly,
  AmmEntityUniswapV2,
  ZapEntity,
} from '../../../entities/zap';
import type { Step } from '../../../reducers/wallet/stepper';
import type { Namespace, TFunction } from 'react-i18next';
import type { CurveMethod } from './curve/types';

export type SwapAggregatorId = 'one-inch' | 'kyber';

export type StrategySwapOption = {
  blockProviders: SwapAggregatorId[];
  blockTokens: string[];
};

export type OptionalStrategySwapOption = {
  swap?: StrategySwapOption;
};

export type SingleStrategyOptions = {
  strategyId: 'single';
} & OptionalStrategySwapOption;

export type UniswapLikeStrategyOptions<TAmm extends AmmEntity> = {
  strategyId: TAmm['type'];
  ammId: TAmm['id'];
} & OptionalStrategySwapOption;

export type UniswapV2StrategyOptions = UniswapLikeStrategyOptions<AmmEntityUniswapV2>;

export type SolidlyStrategyOptions = UniswapLikeStrategyOptions<AmmEntitySolidly>;

export type CurveStrategyOptions = {
  strategyId: 'curve';
  /** Address of the curve pool. Can be undefined if same as the LP token (want) */
  poolAddress?: string | undefined;
  /** Methods to interact with pool, @see curve/types.ts */
  methods: CurveMethod[];
} & OptionalStrategySwapOption;

export type GammaStrategyOptions = {
  strategyId: 'gamma';
  ammId: AmmEntityGamma['id'];
  /** where are the LP tokens held while earning, not needed for merkl as tokens held in strategy */
  tokenHolder?: string | undefined;
} & OptionalStrategySwapOption;

export type ConicStrategyOptions = {
  strategyId: 'conic';
} & OptionalStrategySwapOption;

export type CowcentratedStrategyOptions = {
  strategyId: 'cowcentrated';
} & OptionalStrategySwapOption;

export type StrategyOptions =
  | SingleStrategyOptions
  | UniswapV2StrategyOptions
  | SolidlyStrategyOptions
  | CurveStrategyOptions
  | GammaStrategyOptions
  | ConicStrategyOptions
  | CowcentratedStrategyOptions;

export interface IStrategy {
  readonly id: string;

  beforeQuote?(): Promise<void>;

  beforeStep?(): Promise<void>;

  fetchDepositOptions(): Promise<DepositOption[]>;

  fetchDepositQuote(inputs: InputTokenAmount[], option: DepositOption): Promise<DepositQuote>;

  fetchDepositStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step>;

  fetchWithdrawOptions(): Promise<WithdrawOption[]>;

  fetchWithdrawQuote(inputs: InputTokenAmount[], option: WithdrawOption): Promise<WithdrawQuote>;

  fetchWithdrawStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step>;
}

type BaseTransactHelpers<T extends VaultEntity = VaultEntity> = {
  swapAggregator: ISwapAggregator;
  vault: T;
  vaultType: VaultTypeFromVault<T>;
  getState: () => BeefyState;
};

export type ZaplessTransactHelpers = BaseTransactHelpers & {
  zap: undefined;
};

export type ZapTransactHelpers = BaseTransactHelpers & {
  zap: ZapEntity;
};

export type TransactHelpers = ZaplessTransactHelpers | ZapTransactHelpers;

export function isZapTransactHelpers(helpers: TransactHelpers): helpers is ZapTransactHelpers {
  return helpers.zap !== undefined;
}

export type StrategyConstructor = new (
  options: StrategyOptions,
  helpers: TransactHelpers
) => IStrategy;
