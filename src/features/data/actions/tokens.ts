import type { ChainAddressBook } from '../apis/addressbook.ts';
import { getChainAddressBook } from '../apis/addressbook.ts';
import type { TokenAllowance } from '../apis/allowance/allowance-types.ts';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types.ts';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types.ts';
import {
  getAllowanceApi,
  getBalanceApi,
  getBeefyApi,
  getContractDataApi,
} from '../apis/instances.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { BoostPromoEntity } from '../entities/promo.ts';
import type { CurrentCowcentratedRangeData, TokenEntity } from '../entities/token.ts';
import { isTokenErc20 } from '../entities/token.ts';
import {
  isErc4626Vault,
  isGovVaultMulti,
  isGovVaultSingle,
  type VaultEntity,
  type VaultGov,
} from '../entities/vault.ts';
import { selectBoostById } from '../selectors/boosts.ts';
import { selectAllChains, selectChainById } from '../selectors/chains.ts';
import { selectGovVaultById, selectVaultById } from '../selectors/vaults.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

interface ActionParams {
  chainId: ChainEntity['id'];
}

export interface FetchAddressBookPayload {
  chainId: ChainEntity['id'];
  addressBook: ChainAddressBook;
}

export const fetchAddressBookAction = createAppAsyncThunk<FetchAddressBookPayload, ActionParams>(
  'tokens/fetchAddressBookAction',
  async ({ chainId }, { getState }) => {
    const chain = selectChainById(getState(), chainId);
    const addressBook = await getChainAddressBook(chain);
    return { chainId, addressBook };
  }
);

export const fetchAllAddressBookAction = createAppAsyncThunk<FetchAddressBookPayload[]>(
  'tokens/fetchAllAddressBookAction',
  async (_, { getState }) => {
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
  }
);

interface ReloadBalanceAllowanceRewardsParams {
  chainId: ChainEntity['id'];
  tokens: TokenEntity[];
  spenderAddress: string;
  govVaultId?: VaultGov['id'];
  boostId?: BoostPromoEntity['id'];
  vaultId?: VaultEntity['id'];
  walletAddress: string;
}

export interface ReloadBalanceAllowanceRewardsFulfilledPayload {
  chainId: ChainEntity['id'];
  walletAddress: string;
  spenderAddress: string;
  balance: FetchAllBalancesResult;
  allowance: TokenAllowance[];
  contractData: FetchAllContractDataResult;
  // state: BeefyState; // TODO refactor to not include state
}

export type AllCurrentCowcentratedRangesPayload = Record<
  string,
  CurrentCowcentratedRangeData<string>
>;

// TODO: split this into more specialized actions to make them faster
export const reloadBalanceAndAllowanceAndGovRewardsAndBoostData = createAppAsyncThunk<
  ReloadBalanceAllowanceRewardsFulfilledPayload,
  ReloadBalanceAllowanceRewardsParams
>(
  'deposit/reloadBalanceAndAllowanceAndGovRewards',
  async (
    { chainId, tokens, spenderAddress, govVaultId, boostId, vaultId, walletAddress },
    { getState }
  ) => {
    const chain = selectChainById(getState(), chainId);

    const govVault = govVaultId ? selectGovVaultById(getState(), govVaultId) : null;
    const govVaultSingle = govVault && isGovVaultSingle(govVault) ? govVault : null;
    const govVaultMulti = govVault && isGovVaultMulti(govVault) ? govVault : null;

    const boost = boostId ? selectBoostById(getState(), boostId) : null;
    const boostSingle = boost && boost.version === 1 ? boost : null;
    const boostMulti = boost && boost.version >= 2 ? boost : null;

    const vault = vaultId ? selectVaultById(getState(), vaultId) : null;
    const erc4626Vault = vault && isErc4626Vault(vault) ? vault : null;

    const balanceApi = await getBalanceApi(chain);
    const balanceRes = await balanceApi.fetchAllBalances(
      getState(),
      {
        tokens,
        govVaults: govVault ? [govVault] : [],
        boosts: boost ? [boost] : [],
        erc4626Vaults: erc4626Vault ? [erc4626Vault] : [],
      },
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
    const contractData: FetchAllContractDataResult =
      govVault ?
        await contractDataApi.fetchAllContractData(getState(), {
          govVaults: govVaultSingle ? [govVaultSingle] : [],
          govVaultsMulti: govVaultMulti ? [govVaultMulti] : [],
          boosts: boostSingle ? [boostSingle] : [],
          boostsMulti: boostMulti ? [boostMulti] : [],
          erc4626Vaults: erc4626Vault ? [erc4626Vault] : [],
        })
      : {
          boosts: [],
          govVaults: [],
          govVaultsMulti: [],
          standardVaults: [],
          cowVaults: [],
          erc4626Vaults: [],
        };

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

export const fetchAllCurrentCowcentratedRanges =
  createAppAsyncThunk<AllCurrentCowcentratedRangesPayload>(
    'tokens/fetchAllCurrentCowcentratedRanges',
    async () => {
      const api = await getBeefyApi();
      const data = await api.getAllCowcentratedVaultRanges();
      return Object.assign({}, ...Object.values(data)) as AllCurrentCowcentratedRangesPayload;
    }
  );
