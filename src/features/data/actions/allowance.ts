import type { FetchAllAllowanceResult } from '../apis/allowance/allowance-types.ts';
import { getAllowanceApi } from '../apis/instances.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenErc20 } from '../entities/token.ts';
import type { VaultGov, VaultStandard } from '../entities/vault.ts';
import { isGovVault, isStandardVault } from '../entities/vault.ts';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts.ts';
import { selectChainById } from '../selectors/chains.ts';
import { selectVaultById, selectVaultIdsByChainIdIncludingHidden } from '../selectors/vaults.ts';
import { selectWalletAddress } from '../selectors/wallet.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

interface ActionParams {
  chainId: ChainEntity['id'];
  walletAddress: string;
}

export interface FetchAllAllowanceFulfilledPayload {
  chainId: ChainEntity['id'];
  data: FetchAllAllowanceResult;
}

export const fetchAllAllowanceAction = createAppAsyncThunk<
  FetchAllAllowanceFulfilledPayload,
  ActionParams
>('allowance/fetchAllAllowanceAction', async ({ chainId, walletAddress }, { getState }) => {
  const state = getState();
  const chain = selectChainById(state, chainId);
  const api = await getAllowanceApi(chain);

  // maybe have a way to retrieve those easily
  const boosts = selectBoostsByChainId(state, chainId).map(vaultId =>
    selectBoostById(state, vaultId)
  );
  const allVaults = selectVaultIdsByChainIdIncludingHidden(state, chainId).map(vaultId =>
    selectVaultById(state, vaultId)
  );
  const standardVaults: VaultStandard[] = [];
  const govVaults: VaultGov[] = [];
  for (const vault of allVaults) {
    if (isGovVault(vault)) {
      govVaults.push(vault);
    } else if (isStandardVault(vault)) {
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
  walletAddress: string;
}

export const fetchAllowanceAction = createAppAsyncThunk<
  FetchAllAllowanceFulfilledPayload,
  FetchAllowanceActionParams
>(
  'allowance/fetchAllowanceAction',
  async ({ chainId, spenderAddress, tokens, walletAddress }, { getState }) => {
    const state = getState();
    const userAddress = walletAddress || selectWalletAddress(state);
    const chain = selectChainById(state, chainId);
    const api = await getAllowanceApi(chain);

    const allowanceRes =
      userAddress && spenderAddress ?
        await api.fetchTokensAllowance(getState(), tokens, userAddress, spenderAddress)
      : [];

    return { chainId, data: allowanceRes };
  }
);
