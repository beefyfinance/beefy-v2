import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers/storev2';
import { FetchAllAllowanceResult } from '../apis/allowance/allowance-types';
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
  data: FetchAllAllowanceResult;
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
  const data = await api.fetchAllAllowances(
    // always re-fetch state as late as possible
    getState(),
    standardVaults,
    govVaults,
    boosts,
    walletAddress
  );
  return { chainId, data };
});
