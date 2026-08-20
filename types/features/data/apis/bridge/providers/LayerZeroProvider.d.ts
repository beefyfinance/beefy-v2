import type { BeefyLayerZeroBridgeConfig } from '../../config-types';
import { CommonBridgeProvider } from './CommonBridgeProvider';
export declare class LayerZeroProvider extends CommonBridgeProvider<BeefyLayerZeroBridgeConfig> {
    readonly id = "layer-zero";
}
