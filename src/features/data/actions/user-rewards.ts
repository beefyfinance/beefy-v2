import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getMerklRewardsApi } from '../apis/instances';
import type { ChainEntity } from '../entities/chain';
import { selectChainById } from '../selectors/chains';
import { groupBy, keyBy, mapKeys } from 'lodash-es';
import { BIG_ZERO, fromWeiString } from '../../../helpers/big-number';
import type { BigNumber } from 'bignumber.js';
import {
  selectChainCowcentratedVaultIdsIncludingHidden,
  selectChainHasCowcentratedVaults,
  selectCowcentratedVaultById,
  selectVaultByAddressOrUndefined,
} from '../selectors/vaults';
import { selectIsMerklRewardsForUserChainRecent } from '../selectors/data-loader';
import type { Address } from 'viem';
import { isDefined } from '../utils/array-utils';

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
  byVaultId: Record<
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

export const fetchUserMerklRewardsAction = createAsyncThunk<
  FetchMerklRewardsFulfilledPayload,
  FetchMerklRewardsActionParams,
  { state: BeefyState }
>(
  'rewards/fetchUserMerklRewardsAction',
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
          .filter(
            reason =>
              (reason.id.startsWith('Beefy_') || reason.id.startsWith('BeefyStaker_')) &&
              reason.unclaimed.gt(BIG_ZERO)
          )
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

    // by vault address -> by vault id
    const byVaultId = mapKeys(byVaultAddress, (rewards, vaultAddress) => {
      const vault = selectVaultByAddressOrUndefined(state, chainId, vaultAddress);
      if (vault) {
        return vault.id;
      }

      console.error(`Vault not found for merkl rewards on ${chainId}: ${vaultAddress}`);
      return `${chainId}:${vaultAddress}`;
    });

    // Merge rewards from CLM in to their CLM Pool and CLM Vault
    const clmIds = selectChainCowcentratedVaultIdsIncludingHidden(state, chain.id);
    if (clmIds) {
      for (const clmId of clmIds) {
        const clmRewards = byVaultId[clmId];
        if (!clmRewards) {
          continue;
        }

        const vault = selectCowcentratedVaultById(state, clmId);
        const mergeInto = [vault.cowcentratedGovId, vault.cowcentratedStandardId].filter(isDefined);
        for (const mergeId of mergeInto) {
          const existingRewards = byVaultId[mergeId];
          if (existingRewards) {
            for (const clmReward of clmRewards) {
              const existingReward = existingRewards.find(e => e.address === clmReward.address);
              if (existingReward) {
                existingReward.accumulated = existingReward.accumulated.plus(clmReward.accumulated);
                existingReward.unclaimed = existingReward.unclaimed.plus(clmReward.unclaimed);
              } else {
                existingRewards.push(clmReward);
              }
            }
          } else {
            byVaultId[mergeId] = clmRewards;
          }
        }
      }
    }

    return {
      walletAddress,
      chainId,
      byTokenAddress,
      byVaultId,
    };
  },
  {
    condition({ walletAddress, chainId, recentSeconds }, { getState }) {
      if (!MERKL_SUPPORTED_CHAINS[chainId]) {
        return false;
      }
      const state = getState();
      if (!selectChainHasCowcentratedVaults(state, chainId)) {
        return false;
      }
      return !selectIsMerklRewardsForUserChainRecent(state, walletAddress, chainId, recentSeconds);
    },
  }
);
