import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { getVaultContractApi } from '../apis/instances';
import { GovVaultContractData, StandardVaultContractData } from '../apis/vaultContract';
import { ChainEntity } from '../entities/chain';
import { isGovVault, VaultStandard } from '../entities/vault';
import { selectChainById } from '../selectors/chains';
import { selectVaultByChainId, selectVaultById } from '../selectors/vaults';

export interface FetchGovVaultFulfilledPayload {
  chainId: ChainEntity['id'];
  data: GovVaultContractData[];
  // Reducers handling this action need access to the full state
  state: BeefyState;
}
export interface FetchStandardVaultFulfilledPayload {
  chainId: ChainEntity['id'];
  data: StandardVaultContractData[];
  // Reducers handling this action need access to the full state
  state: BeefyState;
}
interface ActionParams {
  chainId: ChainEntity['id'];
}
export const fetchGovVaultContractDataAction = createAsyncThunk<
  FetchGovVaultFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('vaults-contracts/fetchGovVaultContractData', async ({ chainId }, { getState }) => {
  const state = getState();
  const chain = selectChainById(state, chainId);
  const api = await getVaultContractApi(chain);
  // maybe have a way to retrieve those easily
  const allVaults = selectVaultByChainId(state, chainId).map(vaultId =>
    selectVaultById(state, vaultId)
  );
  const vaults = allVaults.filter(isGovVault);

  const data = await api.fetchGovVaultsContractData(vaults);
  return { chainId, data, state };
});

export const fetchStandardVaultContractDataAction = createAsyncThunk<
  FetchStandardVaultFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('vaults-contracts/fetchStandardVaultContractData', async ({ chainId }, { getState }) => {
  const state = getState();
  const chain = selectChainById(state, chainId);
  const api = await getVaultContractApi(chain);

  // maybe have a way to retrieve those easily
  const allVaults = selectVaultByChainId(state, chainId).map(vaultId =>
    selectVaultById(state, vaultId)
  );
  const vaults = allVaults.filter(v => !isGovVault) as VaultStandard[];

  const data = await api.fetchStandardVaultsContractData(state, vaults);
  return { chainId, data, state };
});
