import type {
  AmmEntity,
  AmmEntityGamma,
  AmmEntitySolidly,
  AmmEntityUniswapV2,
} from '../../../entities/zap';
import type { CurveMethod } from './curve/types';

export type SwapAggregatorId = 'one-inch' | 'kyber';

export type StrategySwapConfig = {
  blockProviders: SwapAggregatorId[];
  blockTokens: string[];
};

export type OptionalStrategySwapConfig = {
  swap?: StrategySwapConfig;
};

export type SingleStrategyConfig = {
  strategyId: 'single';
} & OptionalStrategySwapConfig;

export type UniswapLikeStrategyConfig<TAmm extends AmmEntity> = {
  strategyId: TAmm['type'];
  ammId: TAmm['id'];
} & OptionalStrategySwapConfig;

export type UniswapV2StrategyConfig = UniswapLikeStrategyConfig<AmmEntityUniswapV2>;
export type SolidlyStrategyConfig = UniswapLikeStrategyConfig<AmmEntitySolidly>;

export type CurveStrategyConfig = {
  strategyId: 'curve';
  /** Address of the curve pool. Can be undefined if same as the LP token (want) */
  poolAddress?: string | undefined;
  /** Methods to interact with pool, @see curve/types.ts */
  methods: CurveMethod[];
} & OptionalStrategySwapConfig;

export type GammaStrategyConfig = {
  strategyId: 'gamma';
  ammId: AmmEntityGamma['id'];
  /** where are the LP tokens held while earning, not needed for merkl as tokens held in strategy */
  tokenHolder?: string | undefined;
} & OptionalStrategySwapConfig;

export type ConicStrategyConfig = {
  strategyId: 'conic';
} & OptionalStrategySwapConfig;

export type CowcentratedStrategyConfig = {
  strategyId: 'cowcentrated';
} & OptionalStrategySwapConfig;

export type GovComposerStrategyConfig = {
  strategyId: 'gov-composer';
} & OptionalStrategySwapConfig;

export type VaultComposerStrategyConfig = {
  strategyId: 'vault-composer';
} & OptionalStrategySwapConfig;

export type RewardPoolToVaultStrategyConfig = {
  strategyId: 'reward-pool-to-vault';
} & OptionalStrategySwapConfig;

export type ZapStrategyConfig =
  | SingleStrategyConfig
  | UniswapV2StrategyConfig
  | SolidlyStrategyConfig
  | CurveStrategyConfig
  | GammaStrategyConfig
  | ConicStrategyConfig
  | CowcentratedStrategyConfig
  | GovComposerStrategyConfig
  | VaultComposerStrategyConfig
  | RewardPoolToVaultStrategyConfig;

export type ZapStrategyId = ZapStrategyConfig['strategyId'];

export type AnyStrategyId = ZapStrategyId | 'vault';

export type StrategyIdToConfig<TId extends ZapStrategyId = ZapStrategyId> = {
  [K in TId]: Extract<ZapStrategyConfig, { strategyId: K }>;
}[TId];
