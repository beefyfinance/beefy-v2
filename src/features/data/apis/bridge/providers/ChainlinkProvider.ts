import type { BeefyChainlinkBridgeConfig } from '../../config-types.ts';
import { CommonBridgeProvider } from './CommonBridgeProvider.ts';

export class ChainlinkProvider extends CommonBridgeProvider<BeefyChainlinkBridgeConfig> {
  public readonly id = 'chainlink';
}
