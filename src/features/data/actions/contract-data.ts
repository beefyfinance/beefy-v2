import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { BoostContractData } from '../apis/boost-contract';
import { getBoostContractApi, getVaultContractApi } from '../apis/instances';
import { GovVaultContractData, StandardVaultContractData } from '../apis/vault-contract';
import { ChainEntity } from '../entities/chain';
import { isGovVault, VaultGov, VaultStandard } from '../entities/vault';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectVaultByChainId, selectVaultById } from '../selectors/vaults';

export interface ActionParams {
  chainId: ChainEntity['id'];
}

export interface FetchAllContractDataFulfilledPayload {
  chainId: ChainEntity['id'];
  data: {
    boosts: BoostContractData[];
    standardVaults: StandardVaultContractData[];
    govVaults: GovVaultContractData[];
  };
  // Reducers handling this action need access to the full state
  state: BeefyState;
}

export const fetchAllContractDataByChainAction = createAsyncThunk<
  FetchAllContractDataFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('contract-data/fetchAllContractDataByChainAction', async ({ chainId }, { getState }) => {
  const state = getState();
  const chain = selectChainById(state, chainId);
  const vaultApi = getVaultContractApi(chain);
  const boostApi = getBoostContractApi(chain);

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
  const [boostData, standardVaultData, govVaultData] = await Promise.all([
    boostApi.fetchBoostContractData(boosts),
    vaultApi.fetchStandardVaultsContractData(state, standardVaults),
    vaultApi.fetchGovVaultsContractData(govVaults),
  ]);

  // always re-fetch the latest state
  return {
    chainId,
    data: {
      boosts: boostData,
      govVaults: govVaultData,
      standardVaults: standardVaultData,
    },
    state: getState(),
  };
});
