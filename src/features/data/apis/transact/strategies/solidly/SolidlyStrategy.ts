import type { SolidlyStrategyOptions } from '../IStrategy';
import { UniswapLikeStrategy } from '../UniswapLikeStrategy';
import type { AmmEntity, AmmEntitySolidly } from '../../../../entities/zap';

export class SolidlyStrategy extends UniswapLikeStrategy<AmmEntitySolidly, SolidlyStrategyOptions> {
  public readonly id = 'solidly';

  protected isAmmType(amm: AmmEntity): amm is AmmEntitySolidly {
    return amm.type === 'solidly';
  }
}
