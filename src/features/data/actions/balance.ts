import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { getBalanceApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { selectAllTokenWhereUserCouldHaveBalance } from '../selectors/balance';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectTokenById } from '../selectors/tokens';
import { selectAllGovVaultsByChainId } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';

interface ActionParams {
  chainId: ChainEntity['id'];
}

export interface FetchAllBalanceFulfilledPayload {
  chainId: ChainEntity['id'];
  walletAddress: string;
  data: FetchAllBalancesResult;
  // reducers need the state (balance)
  state: BeefyState;
}

export const fetchAllBalanceAction = createAsyncThunk<
  FetchAllBalanceFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('balance/fetchAllBalanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getBalanceApi(chain);

  const tokens = selectAllTokenWhereUserCouldHaveBalance(state, chainId).map(tokenId =>
    selectTokenById(state, chain.id, tokenId)
  );
  // maybe have a way to retrieve those easily
  const boosts = selectBoostsByChainId(state, chainId).map(boostId =>
    selectBoostById(state, boostId)
  );
  const govVaults = selectAllGovVaultsByChainId(state, chain.id);

  const data = await api.fetchAllBalances(getState(), tokens, govVaults, boosts, walletAddress);
  return {
    chainId,
    walletAddress,
    data,
    state: getState(),
  };
});
