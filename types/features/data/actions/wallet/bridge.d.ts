import type { IBridgeQuote } from '../../apis/bridge/providers/provider-types';
import type { BeefyAnyBridgeConfig } from '../../apis/config-types';
export declare const bridgeViaCommonInterface: (quote: IBridgeQuote<BeefyAnyBridgeConfig>) => import("../../store/types").BeefyThunk;
