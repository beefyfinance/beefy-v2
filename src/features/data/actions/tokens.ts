import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { ChainAddressBook } from '../apis/addressbook';
import { getChainAddressBook } from '../apis/addressbook';
import type { TokenAllowance } from '../apis/allowance/allowance-types';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import { getAllowanceApi, getBalanceApi, getContractDataApi } from '../apis/instances';
import type { BoostEntity } from '../entities/boost';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
import { isTokenErc20 } from '../entities/token';
import type { VaultGov } from '../entities/vault';
import { selectBoostById } from '../selectors/boosts';
import { selectAllChains, selectChainById } from '../selectors/chains';
import { selectGovVaultById } from '../selectors/vaults';

interface ActionParams {
  chainId: ChainEntity['id'];
}

export interface FetchAddressBookPayload {
  chainId: ChainEntity['id'];
  addressBook: ChainAddressBook;
}

export const fetchAddressBookAction = createAsyncThunk<
  FetchAddressBookPayload,
  ActionParams,
  { state: BeefyState }
>('tokens/fetchAddressBookAction', async ({ chainId }, { getState }) => {
  const chain = selectChainById(getState(), chainId);
  const addressBook = await getChainAddressBook(chain);
  return { chainId, addressBook };
});

export const fetchAllAddressBookAction = createAsyncThunk<
  FetchAddressBookPayload[],
  void,
  { state: BeefyState }
>('tokens/fetchAllAddressBookAction', async (_, { getState }) => {
  const chains = selectAllChains(getState());
  if (chains.length <= 0) {
    throw new Error(`Chain config not loaded. Load chain config first`);
  }
  return Promise.all(
    chains.map(async chain => ({
      chainId: chain.id,
      addressBook: await getChainAddressBook(chain),
    }))
  );
});

interface ReloadBalanceAllowanceRewardsParams {
  chainId: ChainEntity['id'];
  tokens: TokenEntity[];
  spenderAddress: string;
  govVaultId?: VaultGov['id'];
  boostId?: BoostEntity['id'];
  walletAddress: string;
}

interface ReloadBalanceAllowanceRewardsFulfilledPayload {
  chainId: ChainEntity['id'];
  walletAddress: string;
  spenderAddress: string;
  balance: FetchAllBalancesResult;
  allowance: TokenAllowance[];
  contractData: FetchAllContractDataResult;
  state: BeefyState;
}

// TODO: split this into more specialized actions to make them faster
export const reloadBalanceAndAllowanceAndGovRewardsAndBoostData = createAsyncThunk<
  ReloadBalanceAllowanceRewardsFulfilledPayload,
  ReloadBalanceAllowanceRewardsParams,
  { state: BeefyState }
>(
  'deposit/reloadBalanceAndAllowanceAndGovRewards',
  async ({ chainId, tokens, spenderAddress, govVaultId, boostId, walletAddress }, { getState }) => {
    const chain = selectChainById(getState(), chainId);

    const govVault = govVaultId ? selectGovVaultById(getState(), govVaultId) : null;
    const boost = boostId ? selectBoostById(getState(), boostId) : null;

    const balanceApi = await getBalanceApi(chain);
    const balanceRes = await balanceApi.fetchAllBalances(
      getState(),
      tokens,
      govVault ? [govVault] : [],
      boost ? [boost] : [],
      walletAddress
    );

    const allowanceApi = await getAllowanceApi(chain);
    const erc20Tokens = tokens.filter(isTokenErc20);
    const allowance: TokenAllowance[] = await allowanceApi.fetchTokensAllowance(
      getState(),
      erc20Tokens,
      walletAddress,
      spenderAddress
    );

    const contractDataApi = await getContractDataApi(chain);
    const contractData: FetchAllContractDataResult = govVault
      ? await contractDataApi.fetchAllContractData(
          getState(),
          [],
          govVault ? [govVault] : [],
          boost ? [boost] : []
        )
      : { boosts: [], govVaults: [], standardVaults: [] };

    return {
      walletAddress,
      allowance,
      balance: balanceRes,
      contractData: contractData,
      chainId,
      spenderAddress,
      state: getState(),
    };
  }
);
