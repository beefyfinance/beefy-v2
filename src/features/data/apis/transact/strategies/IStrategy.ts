import type {
  DepositOption,
  DepositQuote,
  InputTokenAmount,
  TransactQuote,
  WithdrawOption,
  WithdrawQuote,
} from '../transact-types';
import type { VaultType } from '../vaults/IVaultType';
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

export type GammaStrategyOptions = {
  strategyId: 'gamma';
  ammId: AmmEntityGamma['id'];
  chefAddress: string;
} & OptionalStrategySwapOption;

export type StrategyOptions =
  | SingleStrategyOptions
  | UniswapV2StrategyOptions
  | SolidlyStrategyOptions
  | GammaStrategyOptions;

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

export type TransactHelpers = {
  swapAggregator: ISwapAggregator;
  vault: VaultEntity;
  vaultType: VaultType;
  zap: ZapEntity | undefined;
  getState: () => BeefyState;
};

export type StrategyConstructor = new (
  options: StrategyOptions,
  helpers: TransactHelpers
) => IStrategy;
