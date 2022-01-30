import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers/storev2';
import { BoostAllowance, VaultAllowance } from '../apis/allowance';
import { getAllowanceApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { isGovVault, VaultGov, VaultStandard } from '../entities/vault';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectVaultByChainId, selectVaultById } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';

interface ActionParams {
  chainId: ChainEntity['id'];
}

export interface FetchAllAllowanceFulfilledPayload {
  chainId: ChainEntity['id'];
  data: {
    boosts: BoostAllowance[];
    govVaults: VaultAllowance[];
    standardVaults: VaultAllowance[];
  };
}

export const fetchAllAllowanceAction = createAsyncThunk<
  FetchAllAllowanceFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('allowance/fetchBoostAllowanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = getAllowanceApi(chain);

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

  // always re-fetch state as late as possible
  const boostAllowance = await api.fetchBoostAllowance(getState(), boosts, walletAddress);
  const standardVaultAllowance = await api.fetchStandardVaultAllowance(
    getState(),
    standardVaults,
    walletAddress
  );
  const govVaultAllowance = await api.fetchGovVaultPoolAllowance(
    getState(),
    govVaults,
    walletAddress
  );
  return {
    chainId,
    data: {
      boosts: boostAllowance,
      govVaults: govVaultAllowance,
      standardVaults: standardVaultAllowance,
    },
  };
});
