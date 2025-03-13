import type { IZapStrategy, IZapStrategyStatic } from '../IStrategy.ts';
import { UniswapLikeStrategy } from '../UniswapLikeStrategy.ts';
import type { AmmEntity, AmmEntitySolidly } from '../../../../entities/zap.ts';
import type { SolidlyStrategyConfig } from '../strategy-configs.ts';

const strategyId = 'solidly';
type StrategyId = typeof strategyId;

class SolidlyStrategyImpl
  extends UniswapLikeStrategy<AmmEntitySolidly, SolidlyStrategyConfig>
  implements IZapStrategy<StrategyId>
{
  public static readonly id = strategyId;
  public readonly id = strategyId;

  protected isAmmType(amm: AmmEntity): amm is AmmEntitySolidly {
    return amm.type === 'solidly';
  }
}

export const SolidlyStrategy = SolidlyStrategyImpl satisfies IZapStrategyStatic<StrategyId>;
