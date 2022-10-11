import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { isInitialLoader } from '../reducers/data-loader-types';

export const selectBridgeState = (state: BeefyState) => state.ui.bridge;

export const selectBridgeSuportedChains = (state: BeefyState) => state.ui.bridge.supportedChains;

export const selectBridgeStatus = (state: BeefyState) => state.ui.bridge.status;

export const selectIsBridgeLoaded = (state: BeefyState) =>
  state.ui.dataLoader.global.bridge.alreadyLoadedOnce;

export const selectShouldInitBridge = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.bridge);

export const selectBridgeStep = (state: BeefyState) => state.ui.bridge.step;

export const selectBridgeBifiDestChainData = (
  state: BeefyState,
  fromChainId: ChainEntity['id'],
  networkChainId: ChainEntity['networkChainId']
) => {
  return state.ui.bridge.bridgeDataByChainId[fromChainId]
    ? Object.values(state.ui.bridge.bridgeDataByChainId[fromChainId].destChains[networkChainId])[0]
    : null;
};

export const selectBifiAddress = (state: BeefyState, chain: ChainEntity) => {
  const bridgeState = state.ui.bridge;
  const address =
    bridgeState?.bridgeDataByChainId[bridgeState.fromChainId]?.destChains[chain.networkChainId];

  const bifiAddress =
    chain?.id === bridgeState.fromChainId
      ? bridgeState?.bridgeDataByChainId[chain.id]?.address
      : address !== undefined
      ? Object.keys(address)[0]
      : '';
  return bifiAddress;
};

export const selectBridgeTxData = (state: BeefyState) => {
  return state.ui.bridge.bridgeTxData;
};
