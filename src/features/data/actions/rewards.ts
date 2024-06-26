import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getMerklRewardsApi } from '../apis/instances';
import type { ChainEntity } from '../entities/chain';
import { selectChainById } from '../selectors/chains';
import { groupBy, keyBy } from 'lodash-es';
import { BIG_ZERO, fromWeiString } from '../../../helpers/big-number';
import type { BigNumber } from 'bignumber.js';
import { selectChainsHasCowcentratedVaults } from '../selectors/vaults';
import { selectIsMerklRewardsForUserChainRecent } from '../selectors/data-loader';
import type { Address } from 'viem';

// ChainId -> Merkl Distributor contract address
// https://app.merkl.xyz/status
export const MERKL_SUPPORTED_CHAINS: Partial<Record<ChainEntity['id'], Address>> = {
  ethereum: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  polygon: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  optimism: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  arbitrum: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  base: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  gnosis: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  zkevm: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  mantle: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  mode: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  linea: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  bsc: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  zksync: '0xe117ed7Ef16d3c28fCBA7eC49AFAD77f451a6a21',
  fuse: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
  moonbeam: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
};

export type FetchMerklRewardsActionParams = {
  walletAddress: string;
  chainId: ChainEntity['id'];
  recentSeconds?: number;
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
>(
  'rewards/fetchMerklRewardsAction',
  async ({ walletAddress, chainId }, { getState }) => {
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
  },
  {
    condition({ walletAddress, chainId, recentSeconds }, { getState }) {
      if (!MERKL_SUPPORTED_CHAINS[chainId]) {
        return false;
      }
      const state = getState();
      if (!selectChainsHasCowcentratedVaults(state, chainId)) {
        return false;
      }
      return !selectIsMerklRewardsForUserChainRecent(state, walletAddress, chainId, recentSeconds);
    },
  }
);
