import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { TokenAllowance } from '../apis/allowance/allowance-types';
import { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { getAllowanceApi, getBalanceApi, getConfigApi } from '../apis/instances';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { selectBoostById } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectErc20TokenByAddress } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';
import { BoostConfig } from '../apis/config-types';

// given the list of vaults is pulled from some api at some point
// we use the api to create an action
// this action should return just enough data for the state to work with

export interface FulfilledAllBoostsPayload {
  [chainId: ChainEntity['id']]: BoostConfig[];
}
export const fetchAllBoosts = createAsyncThunk<FulfilledAllBoostsPayload>(
  'boosts/fetchAllBoosts',
  async () => {
    const api = getConfigApi();
    return api.fetchAllBoosts();
  }
);
interface InitBoostFormParams {
  boostId: BoostEntity['id'];
  mode: 'stake' | 'unstake';
  walletAddress: string | null;
}

interface InitBoostFormPayload {
  boostId: BoostEntity['id'];
  mode: 'stake' | 'unstake';

  // really, this should be separated
  walletAddress: string | null;
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
