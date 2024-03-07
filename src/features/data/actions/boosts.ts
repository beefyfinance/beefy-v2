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
  mode: 'stake' | 'unstake';
  walletAddress: string | undefined;
}

interface InitBoostFormPayload {
  boostId: BoostEntity['id'];
  mode: 'stake' | 'unstake';

  // really, this should be separated
  walletAddress: string | undefined;
  balance: FetchAllBalancesResult;
  allowance: TokenAllowance[];

  // reducers below need to access the state
  state: BeefyState;
}

export const initiateBoostForm = createAsyncThunk<
  InitBoostFormPayload,
  InitBoostFormParams,
  { state: BeefyState }
>('boosts/initBoostForm', async ({ boostId, mode, walletAddress }, { getState }) => {
  const boost = selectBoostById(getState(), boostId);
  const vault = selectVaultById(getState(), boost.vaultId);
  const chain = selectChainById(getState(), boost.chainId);

  const balanceApi = await getBalanceApi(chain);

  const balanceRes: FetchAllBalancesResult = walletAddress
    ? await balanceApi.fetchAllBalances(getState(), [], [], [boost], walletAddress)
    : { tokens: [], boosts: [], govVaults: [] };

  const spenderAddress = boost.earnContractAddress;

  const allowanceApi = await getAllowanceApi(chain);
  const mooToken = selectErc20TokenByAddress(
    getState(),
    boost.chainId,
    vault.earnedTokenAddress,
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
    boostId,
    mode,
    walletAddress,
    allowance: allowanceRes,
    balance: balanceRes,
    state: getState(),
  };
});
