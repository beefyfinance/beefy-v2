import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { FetchAllAllowanceResult } from '../apis/allowance/allowance-types';
import { getAllowanceApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { TokenErc20 } from '../entities/token';
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
>('allowance/fetchAllAllowanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getAllowanceApi(chain);

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

interface FetchAllowanceActionParams {
  chainId: ChainEntity['id'];
  spenderAddress: string;
  tokens: TokenErc20[];
}

export const fetchAllowanceAction = createAsyncThunk<
  FetchAllAllowanceFulfilledPayload,
  FetchAllowanceActionParams,
  { state: BeefyState }
>('allowance/fetchAllowanceAction', async ({ chainId, spenderAddress, tokens }, { getState }) => {
  const state = getState();
  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getAllowanceApi(chain);

  const allowanceRes =
    walletAddress && spenderAddress
      ? await api.fetchTokensAllowance(getState(), tokens, walletAddress, spenderAddress)
      : [];

  return { chainId, data: allowanceRes };
});
