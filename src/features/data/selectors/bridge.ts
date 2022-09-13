import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { isInitialLoader } from '../reducers/data-loader-types';

export const selectBridgeState = (state: BeefyState) => state.ui.bridge;
export const selectBridgeSuportedChains = (state: BeefyState) => state.ui.bridge.supportedChains;

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

export const selectBifiAddres = (state: BeefyState, chain: ChainEntity) => {
  const bridgeState = state.ui.bridge;
  const address =
    chain.id === bridgeState.fromChainId
      ? bridgeState.bridgeDataByChainId[chain.id].address
      : Object.keys(
          bridgeState?.bridgeDataByChainId[bridgeState.fromChainId]?.destChains[
            chain.networkChainId
          ]
        )[0];
  return address;
};
