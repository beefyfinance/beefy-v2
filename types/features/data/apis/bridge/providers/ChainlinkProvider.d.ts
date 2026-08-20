import type { BeefyChainlinkBridgeConfig } from '../../config-types';
import { CommonBridgeProvider } from './CommonBridgeProvider';
export declare class ChainlinkProvider extends CommonBridgeProvider<BeefyChainlinkBridgeConfig> {
    readonly id = "chainlink";
}
