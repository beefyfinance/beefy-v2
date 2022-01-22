import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { getTokenBalanceApi } from '../apis/instances';
import { TokenBalance } from '../apis/token-balance';
import { ChainEntity } from '../entities/chain';
import { selectChainById } from '../selectors/chains';
import { selectAllTokenByChain, selectTokenById } from '../selectors/tokens';
import { selectWalletAddress } from '../selectors/wallet';

export interface FulfilledPayload {
  chainId: ChainEntity['id'];
  data: TokenBalance[];
}
interface ActionParams {
  chainId: ChainEntity['id'];
}

export const fetchTokenBalanceAction = createAsyncThunk<
  FulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('token-balance/fetchTokenBalanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getTokenBalanceApi(chain);

  const tokens = selectAllTokenByChain(state, chainId).map(tokenId =>
    selectTokenById(state, chain.id, tokenId)
  );
  const data = await api.fetchTokenBalances(tokens, walletAddress);
  return { chainId, data };
});
