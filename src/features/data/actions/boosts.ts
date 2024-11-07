import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { TokenAllowance } from '../apis/allowance/allowance-types';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { getAllowanceApi, getBalanceApi, getConfigApi } from '../apis/instances';
import type { BoostEntity } from '../entities/boost';
import type { ChainEntity } from '../entities/chain';
import { selectBoostById } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectErc20TokenByAddress } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';
import type { BoostCampaignConfig, BoostConfig, BoostPartnerConfig } from '../apis/config-types';
import { isGovVault } from '../entities/vault';

// given the list of vaults is pulled from some api at some point
// we use the api to create an action
// this action should return just enough data for the state to work with

export interface FulfilledAllBoostsPayload {
  boostsByChainId: Record<ChainEntity['id'], BoostConfig[]>;
  partnersById: Record<string, BoostPartnerConfig>;
  campaignsById: Record<string, BoostCampaignConfig>;
}

export const fetchAllBoosts = createAsyncThunk<FulfilledAllBoostsPayload>(
  'boosts/fetchAllBoosts',
  async () => {
    const api = await getConfigApi();
    return api.fetchAllBoosts();
  }
);

interface InitBoostFormParams {
  boostId: BoostEntity['id'];
  walletAddress: string | undefined;
}

interface InitBoostFormPayload {
  walletAddress: string | undefined;
  balance: FetchAllBalancesResult;
  allowance: TokenAllowance[];
  boost: BoostEntity;
}

export const initiateBoostForm = createAsyncThunk<
  InitBoostFormPayload,
  InitBoostFormParams,
  { state: BeefyState }
>('boosts/initBoostForm', async ({ boostId, walletAddress }, { getState }) => {
  const boost = selectBoostById(getState(), boostId);
  const vault = selectVaultById(getState(), boost.vaultId);
  if (isGovVault(vault)) {
    throw new Error(`Gov vaults do not support boosts`);
  }

  const chain = selectChainById(getState(), boost.chainId);

  const balanceApi = await getBalanceApi(chain);

  const balanceRes: FetchAllBalancesResult = walletAddress
    ? await balanceApi.fetchAllBalances(getState(), [], [], [boost], walletAddress)
    : { tokens: [], boosts: [], govVaults: [] };

  const spenderAddress = boost.contractAddress;

  const allowanceApi = await getAllowanceApi(chain);
  const mooToken = selectErc20TokenByAddress(
    getState(),
    boost.chainId,
    vault.receiptTokenAddress,
    false
  );
  const allowanceRes =
    walletAddress && spenderAddress
      ? await allowanceApi.fetchTokensAllowance(
          getState(),
          [mooToken],
          walletAddress,
          spenderAddress
        )
      : [];

  return {
    walletAddress,
    allowance: allowanceRes,
    balance: balanceRes,
    boost,
  };
});
