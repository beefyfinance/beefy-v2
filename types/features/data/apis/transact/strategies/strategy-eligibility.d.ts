import { type TokenEntity } from '../../../entities/token';
import type { ZapTransactHelpers } from './IStrategy';
import type { StrategySwapConfig } from './strategy-configs';
export declare function canRouteToAllOf(helpers: ZapTransactHelpers, swap: StrategySwapConfig | undefined, poolTokens: TokenEntity[], token: TokenEntity): Promise<boolean>;
export declare function canRouteToAnyOf(helpers: ZapTransactHelpers, swap: StrategySwapConfig | undefined, poolTokens: TokenEntity[], token: TokenEntity): Promise<boolean>;
