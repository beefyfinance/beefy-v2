import type { BeefyChainlinkBridgeConfig } from '../../config-types';
import { CommonBridgeProvider } from './CommonBridgeProvider';

export class ChainlinkProvider extends CommonBridgeProvider<BeefyChainlinkBridgeConfig> {
  public readonly id = 'chainlink' as const;
}
