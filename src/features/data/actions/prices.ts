// we use redux toolkit to create actions to avoid a lot of boilerplate code
// nobody likes to write consts and switches anyway
// we also use a trick to reuse the api type, but sometimes the api
// returns way to much data and we can create a stripped down version here

import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyAPI } from '../apis/beefy';
import { ConfigAPI } from '../apis/config';
import { ChainEntity } from '../entities/chain';

// todo: don't instanciate here
const beefyApi = new BeefyAPI();
const configApi = new ConfigAPI();

// or at the api level. Simple at the API level, more flexible here
export const fetchPricesAction = createAsyncThunk<Awaited<ReturnType<BeefyAPI['getPrices']>>, {}>(
  'prices/fetchPrices',
  async () => {
    const prices = await beefyApi.getPrices();
    return prices;
  }
);

// given the list of vaults is pulled from some api at some point
// we use the api to create an action
// this action should return just enough data for the state to work with
export const fetchVaultListAction = createAsyncThunk<
  { chainId: ChainEntity['id']; pools: Awaited<ReturnType<ConfigAPI['fetchVaultByChainId']>> },
  { chainId: ChainEntity['id'] }
>('vaults/fetchVaultListForChain', async ({ chainId }) => {
  const pools = await configApi.fetchVaultByChainId(chainId);
  return { chainId, pools };
});
