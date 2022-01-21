import { createAsyncThunk } from '@reduxjs/toolkit';
import { BoostContractData } from '../apis/boostContract';
import { getBoostContractApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { BeefyState } from '../state';

export interface FulfilledPayload {
  chainId: ChainEntity['id'];
  data: BoostContractData[];
  // Reducers handling this action need access to the full state
  state: BeefyState;
}
interface ActionParams {
  chainId: ChainEntity['id'];
}

export const fetchBoostContractDataAction = createAsyncThunk<
  FulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('boosts-contracts/fetchBoostContractDataAction', async ({ chainId }, { getState }) => {
  const state = getState();
  const chain = selectChainById(state, chainId);
  const api = await getBoostContractApi(chain);
  // maybe have a way to retrieve those easily
  const boosts = selectBoostsByChainId(state, chainId).map(vaultId =>
    selectBoostById(state, vaultId)
  );
  const data = await api.fetchBoostContractData(state, boosts);
  return { chainId, data, state };
});
