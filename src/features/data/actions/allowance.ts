import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { FetchAllAllowanceResult } from '../apis/allowance/allowance-types';
import { getAllowanceApi } from '../apis/instances';
import type { ChainEntity } from '../entities/chain';
import type { TokenErc20 } from '../entities/token';
import type { VaultGov, VaultStandard } from '../entities/vault';
import { isGovVault } from '../entities/vault';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectVaultByChainId, selectVaultById } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';

interface ActionParams {
  chainId: ChainEntity['id'];
  walletAddress: string;
}

export interface FetchAllAllowanceFulfilledPayload {
  chainId: ChainEntity['id'];
  data: FetchAllAllowanceResult;
}

export const fetchAllAllowanceAction = createAsyncThunk<
  FetchAllAllowanceFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('allowance/fetchAllAllowanceAction', async ({ chainId, walletAddress }, { getState }) => {
  const state = getState();

  const userAddress = walletAddress || selectWalletAddress(state);
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
    userAddress
  );
  return { chainId, data };
});

interface FetchAllowanceActionParams {
  chainId: ChainEntity['id'];
  spenderAddress: string;
  tokens: TokenErc20[];
  walletAddress: string;
}

export const fetchAllowanceAction = createAsyncThunk<
  FetchAllAllowanceFulfilledPayload,
  FetchAllowanceActionParams,
  { state: BeefyState }
>(
  'allowance/fetchAllowanceAction',
  async ({ chainId, spenderAddress, tokens, walletAddress }, { getState }) => {
    const state = getState();
    const userAddress = walletAddress || selectWalletAddress(state);
    const chain = selectChainById(state, chainId);
    const api = await getAllowanceApi(chain);

    const allowanceRes =
      userAddress && spenderAddress
        ? await api.fetchTokensAllowance(getState(), tokens, userAddress, spenderAddress)
        : [];

    return { chainId, data: allowanceRes };
  }
);
