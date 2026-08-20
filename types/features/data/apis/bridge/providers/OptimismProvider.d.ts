import type { BeefyOptimismBridgeConfig } from '../../config-types';
import { CommonBridgeProvider } from './CommonBridgeProvider';
export declare class OptimismProvider extends CommonBridgeProvider<BeefyOptimismBridgeConfig> {
    readonly id = "optimism";
}
