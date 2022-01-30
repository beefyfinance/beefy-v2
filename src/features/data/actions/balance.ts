import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers/storev2';
import { BoostBalance, GovVaultPoolBalance, TokenBalance } from '../apis/balance';
import { getBalanceApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectAllTokenByChain, selectTokenById } from '../selectors/tokens';
import { selectAllGovVaultsByChainId } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';

interface ActionParams {
  chainId: ChainEntity['id'];
}

export interface FetchAllBalanceFulfilledPayload {
  chainId: ChainEntity['id'];
  data: {
    tokens: TokenBalance[];
    boosts: BoostBalance[];
    govVaults: GovVaultPoolBalance[];
  };
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
  const api = getBalanceApi(chain);

  const tokens = selectAllTokenByChain(state, chainId).map(tokenId =>
    selectTokenById(state, chain.id, tokenId)
  );
  // maybe have a way to retrieve those easily
  const boosts = selectBoostsByChainId(state, chainId).map(boostId =>
    selectBoostById(state, boostId)
  );
  const govVaults = selectAllGovVaultsByChainId(state, chain.id);

  const tokenBalance = await api.fetchTokenBalances(tokens, walletAddress);
  const govVaultBalance = await api.fetchGovVaultPoolsBalance(govVaults, walletAddress);
  const boostBalance = await api.fetchBoostBalance(boosts, walletAddress);
  return {
    chainId,
    data: {
      boosts: boostBalance,
      tokens: tokenBalance,
      govVaults: govVaultBalance,
    },
    state: getState(),
  };
});
