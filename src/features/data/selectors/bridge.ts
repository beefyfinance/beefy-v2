import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';

export const selectBifiBridgeDataByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  return state.entities.bridge.byChainId[chainId];
};
