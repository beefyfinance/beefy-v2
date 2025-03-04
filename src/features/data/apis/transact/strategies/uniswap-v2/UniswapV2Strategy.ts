import type { IZapStrategyStatic } from '../IStrategy.ts';
import { UniswapLikeStrategy } from '../UniswapLikeStrategy.ts';
import type { AmmEntity, AmmEntityUniswapV2 } from '../../../../entities/zap.ts';
import type { UniswapV2StrategyConfig } from '../strategy-configs.ts';

const strategyId = 'uniswap-v2';
type StrategyId = typeof strategyId;

export class UniswapV2StrategyImpl extends UniswapLikeStrategy<
  AmmEntityUniswapV2,
  UniswapV2StrategyConfig
> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  protected isAmmType(amm: AmmEntity): amm is AmmEntityUniswapV2 {
    return amm.type === 'uniswap-v2';
  }
}

export const UniswapV2Strategy = UniswapV2StrategyImpl satisfies IZapStrategyStatic<StrategyId>;
