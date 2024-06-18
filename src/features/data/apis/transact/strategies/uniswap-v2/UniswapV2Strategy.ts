import type { IZapStrategyStatic } from '../IStrategy';
import { UniswapLikeStrategy } from '../UniswapLikeStrategy';
import type { AmmEntity, AmmEntityUniswapV2 } from '../../../../entities/zap';
import type { UniswapV2StrategyConfig } from '../strategy-configs';

const strategyId = 'uniswap-v2' as const;
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
