import type { IZapStrategy, IZapStrategyStatic } from '../IStrategy';
import { UniswapLikeStrategy } from '../UniswapLikeStrategy';
import type { AmmEntity, AmmEntitySolidly } from '../../../../entities/zap';
import type { SolidlyStrategyConfig } from '../strategy-configs';

const strategyId = 'solidly' as const;
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
