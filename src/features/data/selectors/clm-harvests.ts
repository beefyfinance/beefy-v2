/* eslint-disable @typescript-eslint/no-unused-vars */
import { isAfter } from 'date-fns';
import { BIG_ZERO } from '../../../helpers/big-number';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import type { VaultEntity } from '../entities/vault';
import { selectLastVaultDepositStart, selectUserDepositedTimelineByVaultId } from './analytics';
import { selectVaultById } from './vaults';
import { sortBy } from 'lodash-es';
import { selectUserVaultBalanceInShareToken } from './balance';
import { selectCowcentratedVaultDepositTokensWithPrices } from './tokens';

export const selectClmHasHarvestByVaultAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  vaultAddress: VaultEntity['earnContractAddress']
) => {
  return !!state.entities.harvests.byChainId[chainId]?.harvests.byVaultAddress[vaultAddress]
    ?.harvests;
};

export const selectClmHarvestsByVaultAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  vaultAddress: VaultEntity['earnContractAddress']
) => {
  return state.entities.harvests.byChainId[chainId]?.harvests.byVaultAddress[vaultAddress]
    ?.harvests;
};

export const selectClmPendingRewardsByVaultAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  vaultAddress: VaultEntity['earnContractAddress']
) => {
  return state.entities.harvests.byChainId[chainId]?.harvests.byVaultAddress[vaultAddress]
    ?.pendingRewards;
};

export const selectClmAutocompundedFeesByVaultAddress = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  const harvests = selectClmHarvestsByVaultAddress(state, vault.chainId, vault.earnContractAddress);
  const pendingRewards = selectClmPendingRewardsByVaultAddress(
    state,
    vault.chainId,
    vault.earnContractAddress
  );

  const timeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);
  const currentMooTokenBalance = selectUserVaultBalanceInShareToken(state, vault.id, walletAddress);

  const { fees0, fees1, totalSupply } = pendingRewards ?? {
    fees0: BIG_ZERO,
    fees1: BIG_ZERO,
    totalSupply: BIG_ZERO,
  };

  const { token0, token1 } = selectCowcentratedVaultDepositTokensWithPrices(state, vaultId);

  const { price: token0Price, symbol: token0Symbol, decimals: token0Decimals } = token0;
  const { price: token1Price, symbol: token1Symbol, decimals: token1Decimals } = token1;

  const firstDeposit = selectLastVaultDepositStart(state, vaultId, walletAddress);

  const filteredHarvests = sortBy(harvests, 'timestamp').filter(harvest => {
    return isAfter(harvest.timestamp, firstDeposit);
  });

  let timelineIdx = 0;

  const { token0AccruedRewards, token1AccruedRewards } = filteredHarvests.reduce(
    (acc, harvest) => {
      const { totalSupply, compoundedAmount0, compoundedAmount1 } = harvest;

      if (
        timelineIdx < timeline.length - 1 &&
        isAfter(harvest.timestamp, timeline[timelineIdx + 1].datetime)
      ) {
        timelineIdx++;
      }

      acc.token0AccruedRewards = acc.token0AccruedRewards.plus(
        timeline[timelineIdx].shareBalance.dividedBy(totalSupply).times(compoundedAmount0)
      );
      acc.token1AccruedRewards = acc.token1AccruedRewards.plus(
        timeline[timelineIdx].shareBalance.dividedBy(totalSupply).times(compoundedAmount1)
      );
      return acc;
    },
    {
      token0AccruedRewards: BIG_ZERO,
      token1AccruedRewards: BIG_ZERO,
    }
  );
  const pendingRewards0 = currentMooTokenBalance.dividedBy(totalSupply).times(fees0);
  const pendingRewards1 = currentMooTokenBalance.dividedBy(totalSupply).times(fees1);

  const token0AccruedRewardsToUsd = token0AccruedRewards.times(token0Price);
  const token1AccruedRewardsToUsd = token1AccruedRewards.times(token1Price);
  //apply beefy fee of 9.5%
  const pendingRewards0ToUsd = pendingRewards0.times(token0Price).times(0.905);
  const pendingRewards1ToUsd = pendingRewards1.times(token1Price).times(0.905);

  return {
    token0AccruedRewards,
    token1AccruedRewards,
    pendingRewards0,
    pendingRewards1,
    token0AccruedRewardsToUsd,
    token1AccruedRewardsToUsd,
    pendingRewards0ToUsd,
    pendingRewards1ToUsd,
    token0Symbol,
    token1Symbol,
    token0Decimals,
    token1Decimals,
    totalAutocompouned: token0AccruedRewardsToUsd.plus(token1AccruedRewardsToUsd),
    totalPending: pendingRewards0ToUsd.plus(pendingRewards1ToUsd),
  };
};
