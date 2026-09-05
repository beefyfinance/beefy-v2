import type { BridgeEntity } from '../entities/bridge.ts';
import type { BeefyState } from '../store/types.ts';

const warnedUnknownBridgeIds = new Set<BridgeEntity['id']>();

export const selectBridgeByIdIfKnown = (
  state: BeefyState,
  bridgeId: BridgeEntity['id']
): BridgeEntity | undefined => {
  const bridge = state.entities.bridges.byId[bridgeId];
  // the config loads after first render, so an empty map means not yet rather than unknown
  if (
    bridge === undefined &&
    state.entities.bridges.allIds.length > 0 &&
    !warnedUnknownBridgeIds.has(bridgeId)
  ) {
    warnedUnknownBridgeIds.add(bridgeId);
    console.warn(`selectBridgeByIdIfKnown: Unknown bridge id ${bridgeId}`);
  }
  return bridge;
};
