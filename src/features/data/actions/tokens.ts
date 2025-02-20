import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { ChainAddressBook } from '../apis/addressbook';
import { getChainAddressBook } from '../apis/addressbook';
import type { TokenAllowance } from '../apis/allowance/allowance-types';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import { getAllowanceApi, getBalanceApi, getBeefyApi, getContractDataApi } from '../apis/instances';
import type { BoostPromoEntity } from '../entities/promo';
import type { ChainEntity } from '../entities/chain';
import type { CurrentCowcentratedRangeData, TokenEntity } from '../entities/token';
import { isTokenErc20 } from '../entities/token';
import { isGovVaultMulti, isGovVaultSingle, type VaultGov } from '../entities/vault';
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
  boostId?: BoostPromoEntity['id'];
  walletAddress: string;
}

interface ReloadBalanceAllowanceRewardsFulfilledPayload {
  chainId: ChainEntity['id'];
  walletAddress: string;
  spenderAddress: string;
  balance: FetchAllBalancesResult;
  allowance: TokenAllowance[];
  contractData: FetchAllContractDataResult;
  state: BeefyState; // TODO refactor to not include state
}

export type AllCurrentCowcentratedRangesPayload = Record<string, CurrentCowcentratedRangeData>;

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
    const govVaultSingle = govVault && isGovVaultSingle(govVault) ? govVault : null;
    const govVaultMulti = govVault && isGovVaultMulti(govVault) ? govVault : null;

    const boost = boostId ? selectBoostById(getState(), boostId) : null;
    const boostSingle = boost && boost.version === 1 ? boost : null;
    const boostMulti = boost && boost.version >= 2 ? boost : null;

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
          govVaultSingle ? [govVaultSingle] : [],
          govVaultMulti ? [govVaultMulti] : [],
          [],
          boostSingle ? [boostSingle] : [],
          boostMulti ? [boostMulti] : []
        )
      : { boosts: [], govVaults: [], govVaultsMulti: [], standardVaults: [], cowVaults: [] };

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

export const fetchAllCurrentCowcentratedRanges = createAsyncThunk<
  AllCurrentCowcentratedRangesPayload,
  void,
  { state: BeefyState }
>('tokens/fetchAllCurrentCowcentratedRanges', async () => {
  const api = await getBeefyApi();
  const data = await api.getAllCowcentratedVaultRanges();
  return Object.assign({}, ...Object.values(data));
});
