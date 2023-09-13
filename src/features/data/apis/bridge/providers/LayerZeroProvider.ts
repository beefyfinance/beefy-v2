import type { BeefyLayerZeroBridgeConfig } from '../../config-types';
import { CommonBridgeProvider } from './CommonBridgeProvider';

export class LayerZeroProvider extends CommonBridgeProvider<BeefyLayerZeroBridgeConfig> {
  public readonly id = 'layer-zero' as const;
}
