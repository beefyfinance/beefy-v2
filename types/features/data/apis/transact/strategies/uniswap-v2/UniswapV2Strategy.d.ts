import { UniswapLikeStrategy } from '../UniswapLikeStrategy';
import type { AmmEntity, AmmEntityUniswapV2 } from '../../../../entities/zap';
import type { UniswapV2StrategyConfig } from '../strategy-configs';
export declare class UniswapV2StrategyImpl extends UniswapLikeStrategy<AmmEntityUniswapV2, UniswapV2StrategyConfig> {
    static readonly id = "uniswap-v2";
    static readonly composable = true;
    readonly id = "uniswap-v2";
    protected isAmmType(amm: AmmEntity): amm is AmmEntityUniswapV2;
}
export declare const UniswapV2Strategy: typeof UniswapV2StrategyImpl;
