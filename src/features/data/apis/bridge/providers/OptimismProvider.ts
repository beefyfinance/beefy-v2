import type { BeefyOptimismBridgeConfig } from '../../config-types.ts';
import { CommonBridgeProvider } from './CommonBridgeProvider.ts';

export class OptimismProvider extends CommonBridgeProvider<BeefyOptimismBridgeConfig> {
  public readonly id = 'optimism';
}
