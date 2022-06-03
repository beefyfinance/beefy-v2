import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';

export const selectBridgeBifiDestChainData = (
  state: BeefyState,
  fromChainId: ChainEntity['id'],
  networkChainId: ChainEntity['networkChainId']
) => {
  return state.ui.bridgeModal.bridgeDataByChainId[fromChainId]
    ? Object.values(
        state.ui.bridgeModal.bridgeDataByChainId[fromChainId].destChains[networkChainId]
      )[0]
    : null;
};
