import type { IComposableStrategy } from '../IStrategy';
import { UniswapLikeStrategy } from '../UniswapLikeStrategy';
import type { AmmEntity, AmmEntitySolidly } from '../../../../entities/zap';
import type { SolidlyStrategyConfig } from '../strategy-configs';
declare const strategyId = "solidly";
type StrategyId = typeof strategyId;
declare class SolidlyStrategyImpl extends UniswapLikeStrategy<AmmEntitySolidly, SolidlyStrategyConfig> implements IComposableStrategy<StrategyId> {
    static readonly id = "solidly";
    static readonly composable = true;
    readonly id = "solidly";
    protected isAmmType(amm: AmmEntity): amm is AmmEntitySolidly;
}
export declare const SolidlyStrategy: typeof SolidlyStrategyImpl;
export {};
