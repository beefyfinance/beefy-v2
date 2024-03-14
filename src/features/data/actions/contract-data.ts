import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import { getContractDataApi } from '../apis/instances';
import type { ChainEntity } from '../entities/chain';
import type { VaultCowcentrated, VaultGov, VaultStandard } from '../entities/vault';
import { isGovVault, isStandardVault } from '../entities/vault';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectVaultIdsByChainId, selectVaultById } from '../selectors/vaults';
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
  const allVaults = selectVaultIdsByChainId(state, chainId).map(vaultId =>
    selectVaultById(state, vaultId)
  );
  const standardVaults: VaultStandard[] = [];
  const govVaults: VaultGov[] = [];
  const cowcentratedLiquidityVaults: VaultCowcentrated[] = [];
  for (const vault of allVaults) {
    if (isGovVault(vault)) {
      govVaults.push(vault);
    } else if (isStandardVault(vault)) {
      standardVaults.push(vault);
    } else {
      cowcentratedLiquidityVaults.push(vault);
    }
  }

  const res = await contractApi.fetchAllContractData(
    state,
    standardVaults,
    govVaults,
    cowcentratedLiquidityVaults,
    boosts
  );

  // always re-fetch the latest state
  return {
    chainId,
    data: res,
    state: getState(),
  };
});
