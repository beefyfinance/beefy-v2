import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getMerklRewardsApi } from '../apis/instances';
import type { ChainEntity } from '../entities/chain';
import { selectChainById } from '../selectors/chains';
import { groupBy, keyBy } from 'lodash-es';
import { BIG_ZERO, fromWeiString } from '../../../helpers/big-number';
import type { BigNumber } from 'bignumber.js';
import { selectChainsWithCowcentratedVaults } from '../selectors/vaults';

const MERKL_SUPPORTED_CHAINS: Set<ChainEntity['id']> = new Set([
  'ethereum',
  'arbitrum',
  'optimism',
  'base',
  'polygon',
  'zkevm',
  'mantle',
  'mode',
  'linea',
  'gnosis',
  'bsc',
  'zksync',
  'fuse',
  'moonbeam',
]);

export const fetchAllRewardsAction = createAsyncThunk<
  void,
  { walletAddress: string },
  { state: BeefyState }
>('rewards/fetchAllRewardsAction', async ({ walletAddress }, { dispatch, getState }) => {
  const clmChains = selectChainsWithCowcentratedVaults(getState());
  const merklChains = clmChains.filter(chainId => MERKL_SUPPORTED_CHAINS.has(chainId));
  if (!merklChains.length) {
    console.warn(
      `Not checking for merkl rewards, no chains with clm vaults and merkl support found.`
    );
    console.debug('clmChains', clmChains);
    console.debug('MERKL_SUPPORTED_CHAINS', MERKL_SUPPORTED_CHAINS);
    return;
  }

  await Promise.allSettled(
    merklChains.map(chainId => dispatch(fetchMerklRewardsAction({ walletAddress, chainId })))
  );
});

export type FetchMerklRewardsActionParams = {
  walletAddress: string;
  chainId: ChainEntity['id'];
};

export type FetchMerklRewardsFulfilledPayload = {
  walletAddress: string;
  chainId: ChainEntity['id'];
  byTokenAddress: Record<
    string,
    {
      address: string;
      decimals: number;
      symbol: string;
      accumulated: BigNumber;
      unclaimed: BigNumber;
      reasons: {
        id: string;
        accumulated: BigNumber;
        unclaimed: BigNumber;
      }[];
      proof: string[];
    }
  >;
  byVaultAddress: Record<
    string,
    {
      address: string;
      symbol: string;
      decimals: number;
      accumulated: BigNumber;
      unclaimed: BigNumber;
    }[]
  >;
};

export const fetchMerklRewardsAction = createAsyncThunk<
  FetchMerklRewardsFulfilledPayload,
  FetchMerklRewardsActionParams,
  { state: BeefyState }
>('rewards/fetchMerklRewardsAction', async ({ walletAddress, chainId }, { getState }) => {
  const state = getState();
  const chain = selectChainById(state, chainId);
  const api = await getMerklRewardsApi();

  const userRewards = await api.fetchUserRewards({
    user: walletAddress,
    chainId: chain.networkChainId,
  });

  const rewardsPerToken = Object.entries(userRewards)
    .map(([tokenAddress, tokenData]) => ({
      ...tokenData,
      address: tokenAddress.toLowerCase(),
      unclaimed: fromWeiString(tokenData.unclaimed, tokenData.decimals),
      accumulated: fromWeiString(tokenData.accumulated, tokenData.decimals),
      reasons: Object.entries(tokenData.reasons)
        .map(([reason, reasonData]) => ({
          ...reasonData,
          id: reason,
          unclaimed: fromWeiString(reasonData.unclaimed, tokenData.decimals),
          accumulated: fromWeiString(reasonData.accumulated, tokenData.decimals),
        }))
        .filter(r => r.unclaimed.gt(BIG_ZERO)),
    }))
    .filter(r => r.unclaimed.gt(BIG_ZERO) && r.symbol !== 'aglaMerkl');

  const byTokenAddress = keyBy(rewardsPerToken, r => r.address);

  const byVaultAddress = groupBy(
    rewardsPerToken.flatMap(reward =>
      reward.reasons
        .filter(reason => reason.id.startsWith('Beefy_') && reason.unclaimed.gt(BIG_ZERO))
        .map(reason => ({
          vaultAddress: reason.id.split('_')[1].toLowerCase(),
          ...reason,
          address: reward.address,
          symbol: reward.symbol,
          decimals: reward.decimals,
        }))
    ),
    r => r.vaultAddress
  );

  return {
    walletAddress,
    chainId,
    byTokenAddress,
    byVaultAddress,
  };
});
