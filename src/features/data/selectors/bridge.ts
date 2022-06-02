import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';

export const selectBifiDestChainData = (
  state: BeefyState,
  networkChainId: ChainEntity['networkChainId']
) => {
  return state.ui.bridgeModal.bridgeFromData.destChains[networkChainId]
    ? Object.values(state.ui.bridgeModal.bridgeFromData.destChains[networkChainId])[0]
    : null;
};
