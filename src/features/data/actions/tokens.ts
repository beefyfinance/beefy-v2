import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { ChainAddressBook, getChainAddressBook } from '../apis/addressbook';
import { TokenAllowance } from '../apis/allowance/allowance-types';
import { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import { getAllowanceApi, getBalanceApi, getContractDataApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { isTokenErc20, TokenEntity } from '../entities/token';
import { VaultGov } from '../entities/vault';
import { selectChainById } from '../selectors/chains';
import { selectGovVaultById } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';

interface ActionParams {
  chainId: ChainEntity['id'];
}

interface FetchAddressBookPayload {
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

interface ReloadBalanceAllowanceRewardsParams {
  chainId: ChainEntity['id'];
  tokens: TokenEntity[];
  spenderAddress: string;
  govVaultId?: VaultGov['id'];
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

export const reloadBalanceAndAllowanceAndGovRewards = createAsyncThunk<
  ReloadBalanceAllowanceRewardsFulfilledPayload,
  ReloadBalanceAllowanceRewardsParams,
  { state: BeefyState }
>(
  'deposit/reloadBalanceAndAllowanceAndGovRewards',
  async ({ chainId, tokens, spenderAddress, govVaultId }, { getState }) => {
    const chain = selectChainById(getState(), chainId);
    const walletAddress = selectWalletAddress(getState());

    const govVault = govVaultId ? selectGovVaultById(getState(), govVaultId) : null;

    const govVaults: VaultGov[] = govVault ? [govVault] : [];
    const balanceApi = await getBalanceApi(chain);
    const balanceRes = await balanceApi.fetchAllBalances(
      getState(),
      tokens,
      govVaults,
      [],
      walletAddress
    );

    const allowanceApi = await getAllowanceApi(chain);
    const erc20Tokens = tokens.filter(isTokenErc20);
    const allowanceRes = await allowanceApi.fetchTokensAllowance(
      erc20Tokens,
      walletAddress,
      spenderAddress
    );
    const allowance: TokenAllowance[] = allowanceRes;

    const contractDataApi = await getContractDataApi(chain);
    const contractData: FetchAllContractDataResult = govVault
      ? await contractDataApi.fetchAllContractData(getState(), [], [govVault], [])
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
