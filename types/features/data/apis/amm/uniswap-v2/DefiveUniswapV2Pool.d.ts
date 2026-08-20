import type { FactoryData as BaseFactoryData } from './UniswapV2Pool';
import { UniswapV2Pool } from './UniswapV2Pool';
export declare class DefiveUniswapV2Pool extends UniswapV2Pool {
    protected factoryData: BaseFactoryData | undefined;
    protected updateFactoryData(): Promise<void>;
}
