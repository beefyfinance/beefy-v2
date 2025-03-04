import type { BeefyLayerZeroBridgeConfig } from '../../config-types.ts';
import { CommonBridgeProvider } from './CommonBridgeProvider.ts';

export class LayerZeroProvider extends CommonBridgeProvider<BeefyLayerZeroBridgeConfig> {
  public readonly id = 'layer-zero';
}
