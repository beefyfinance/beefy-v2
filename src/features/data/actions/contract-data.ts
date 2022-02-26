import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import { getContractDataApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { isGovVault, VaultGov, VaultStandard } from '../entities/vault';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectVaultByChainId, selectVaultById } from '../selectors/vaults';
import { featureFlag_simulateRpcError } from '../utils/feature-flags';

interface ActionParams {
  chainId: ChainEntity['id'];
}

export interface FetchAllContractDataFulfilledPayload {
  chainId: ChainEntity['id'];
  data: FetchAllContractDataResult;
  // Reducers handling this action need access to the full state
  state: BeefyState;
}

export const fetchAllContractDataByChainAction = createAsyncThunk<
  FetchAllContractDataFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('contract-data/fetchAllContractDataByChainAction', async ({ chainId }, { getState }) => {
  if (featureFlag_simulateRpcError(chainId)) {
    throw new Error('Simulated RPC error');
  }

  const state = getState();
  const chain = selectChainById(state, chainId);
  const contractApi = await getContractDataApi(chain);

  // maybe have a way to retrieve those easily
  const boosts = selectBoostsByChainId(state, chainId).map(vaultId =>
    selectBoostById(state, vaultId)
  );
  const allVaults = selectVaultByChainId(state, chainId).map(vaultId =>
    selectVaultById(state, vaultId)
  );
  const standardVaults: VaultStandard[] = [];
  const govVaults: VaultGov[] = [];
  for (const vault of allVaults) {
    if (isGovVault(vault)) {
      govVaults.push(vault);
    } else {
      standardVaults.push(vault);
    }
  }
  const res = await contractApi.fetchAllContractData(state, standardVaults, govVaults, boosts);

  // always re-fetch the latest state
  return {
    chainId,
    data: res,
    state: getState(),
  };
});
