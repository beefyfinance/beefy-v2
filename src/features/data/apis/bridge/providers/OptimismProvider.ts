import type { BeefyOptimismBridgeConfig } from '../../config-types';
import { CommonBridgeProvider } from './CommonBridgeProvider';

export class OptimismProvider extends CommonBridgeProvider<BeefyOptimismBridgeConfig> {
  public readonly id = 'optimism' as const;
}
