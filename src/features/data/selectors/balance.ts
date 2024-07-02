import { mooAmountToOracleAmount } from '../utils/ppfs';
import type { BeefyState } from '../../../redux-types';
import type { BoostEntity } from '../entities/boost';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity, TokenLpBreakdown } from '../entities/token';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  isCowcentratedVault,
  isGovVault,
  isGovVaultMulti,
  isGovVaultSingle,
  isStandardVault,
  type VaultEntity,
  type VaultGov,
} from '../entities/vault';
import { selectActiveVaultBoostIds, selectAllVaultBoostIds, selectBoostById } from './boosts';
import { createCachedSelector } from 're-reselect';
import {
  selectDepositTokenByVaultId,
  selectHasBreakdownDataByTokenAddress,
  selectIsTokenStable,
  selectLpBreakdownForVault,
  selectShareTokenByVaultId,
  selectTokenByAddress,
  selectTokenByIdOrUndefined,
  selectTokenPriceByAddress,
  selectTokenPriceByTokenOracleId,
  selectTokensByChainId,
  selectVaultTokenSymbols,
  selectWrappedToNativeSymbolOrTokenSymbol,
} from './tokens';
import {
  selectGovVaultById,
  selectIsVaultStable,
  selectStandardVaultById,
  selectVaultById,
  selectVaultPricePerFullShare,
} from './vaults';
import { selectWalletAddress, selectWalletAddressIfKnown } from './wallet';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number';
import BigNumber from 'bignumber.js';
import { getTopNArray } from '../utils/array-utils';
import { orderBy } from 'lodash-es';
import { createSelector } from '@reduxjs/toolkit';
import { selectChainById } from './chains';
import { selectVaultPnl } from './analytics';
import { entries } from '../../../helpers/object';
import type { UserLpBreakdownBalance } from './balance-types';
import { isUserClmPnl, type UserVaultPnl } from './analytics-types';
import { selectPlatformById } from './platforms';
import type { TokenAmount } from '../apis/transact/transact-types';

const _selectWalletBalance = (state: BeefyState, walletAddress?: string) => {
  if (walletAddress) {
    return selectWalletBalanceByAddress(state, walletAddress);
  }

  const userAddress = selectWalletAddress(state);
  if (userAddress) {
    return selectWalletBalanceByAddress(state, userAddress);
  }

  return undefined;
};

export const selectWalletBalanceByAddress = createCachedSelector(
  (state: BeefyState, _walletAddress: string) => state.user.balance.byAddress,
  (state: BeefyState, walletAddress: string) => walletAddress.toLocaleLowerCase(),
  (balancesByAddress, walletAddress) => balancesByAddress[walletAddress] || undefined
)((state: BeefyState, walletAddress: string) => walletAddress);

export const selectAllTokenWhereUserCouldHaveBalance = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => selectTokensByChainId(state, chainId),
  tokens => tokens.interestingBalanceTokenAddresses
);

export const selectHasWalletBalanceBeenFetched = (state: BeefyState, walletAddress: string) => {
  return state.user.balance.byAddress[walletAddress.toLowerCase()] !== undefined;
};

export const selectUserDepositedVaultIds = (state: BeefyState, walletAddress?: string) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.depositedVaultIds || [];
};

/**
 * Same as selectUserDepositedVaultIds, except:
 * Excluding any CLM vaults if they used as the deposit token for other vaults
 */
export const selectDashboardDepositedVaultIdsForAddress = createSelector(
  (state: BeefyState, address: string) =>
    state.user.balance.byAddress[address.toLowerCase()]?.depositedVaultIds,
  (state: BeefyState) => state.entities.vaults.byId,
  (vaultIds, vaultsById) => {
    if (!vaultIds) {
      return [];
    }

    return vaultIds.filter(vaultId => {
      const vault = vaultsById[vaultId];
      // should never happen
      if (!vault) {
        return false;
      }

      // include all non-CLM vaults
      if (!isCowcentratedVault(vault)) {
        return true;
      }

      // include CLM only if there is no gov/standard vault for it
      return vault.cowcentratedGovId === undefined && vault.cowcentratedStandardId === undefined;
    });
  }
);

export const selectUserDepositedVaultIdsForAsset = (state: BeefyState, asset: string) => {
  const vaultIds = selectUserDepositedVaultIds(state);
  return vaultIds.filter(vaultId => {
    const vault = selectVaultById(state, vaultId);
    return vault.assetIds.includes(asset);
  });
};

export const selectHasUserDepositInVault = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const walletBalance = _selectWalletBalance(state);
  return walletBalance ? walletBalance.depositedVaultIds.indexOf(vaultId) !== -1 : false;
};

export const selectHasUserBalanceInActiveBoost = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const activeBoostsIds = selectActiveVaultBoostIds(state, vaultId);
  let userBalance = BIG_ZERO;
  activeBoostsIds.forEach(boostId => {
    userBalance = userBalance.plus(selectBoostUserBalanceInToken(state, boostId) ?? BIG_ZERO);
  });
  return userBalance.isGreaterThan(0);
};

export const selectUserBalanceOfToken = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenAddress: TokenEntity['address'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return (
    walletBalance?.tokenAmount.byChainId[chainId]?.byTokenAddress[tokenAddress.toLowerCase()]
      ?.balance || BIG_ZERO
  );
};

/**
 * Directly held shares only, excludes any shares deposited in boosts or bridged to another chain
 * (For gov vaults this will be in deposit token since there are no shares)
 */
export const selectUserVaultBalanceInShareToken = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  maybeWalletAddress?: string
) => {
  const walletAddress = maybeWalletAddress || selectWalletAddress(state);
  if (!walletAddress) {
    return BIG_ZERO;
  }

  const vault = selectVaultById(state, vaultId);

  if (isGovVault(vault)) {
    if (isGovVaultSingle(vault)) {
      return selectGovVaultUserStakedBalanceInDepositToken(state, vaultId, walletAddress);
    } else if (isGovVaultMulti(vault)) {
      return selectUserBalanceOfToken(
        state,
        vault.chainId,
        vault.receiptTokenAddress,
        walletAddress
      );
    }
  }

  if (isStandardVault(vault) || isCowcentratedVault(vault)) {
    return selectUserBalanceOfToken(state, vault.chainId, vault.receiptTokenAddress, walletAddress);
  }

  throw new Error(`Unsupported vault type for ${vaultId}`);
};

/**
 * Only includes shares deposited in boosts
 */
export const selectUserVaultBalanceInShareTokenInBoosts = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  maybeWalletAddress?: string
) => {
  const walletAddress = maybeWalletAddress || selectWalletAddress(state);
  if (!walletAddress) {
    return BIG_ZERO;
  }

  // all deposits in boost (even those expired)
  let shares = BIG_ZERO;
  const boostIds = selectAllVaultBoostIds(state, vaultId);
  for (const boostId of boostIds) {
    shares = shares.plus(selectBoostUserBalanceInToken(state, boostId, walletAddress));
  }

  return shares;
};

/**
 * Only includes shares bridged to another chain
 */
export const selectUserVaultBalanceInShareTokenInBridged = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  maybeWalletAddress?: string
) => {
  const walletAddress = maybeWalletAddress || selectWalletAddress(state);
  if (!walletAddress) {
    return BIG_ZERO;
  }

  const vault = selectVaultById(state, vaultId);
  if (!isStandardVault(vault) || !vault.bridged) {
    return BIG_ZERO;
  }

  let shares = BIG_ZERO;
  for (const [chainId, tokenAddress] of entries(vault.bridged)) {
    shares = shares.plus(selectUserBalanceOfToken(state, chainId, tokenAddress, walletAddress));
  }

  return shares;
};

type UserBalanceSelector = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  maybeWalletAddress?: string
) => BigNumber;
type UserBalanceWithTokenSelector = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  maybeWalletAddress?: string
) => TokenAmount;

/**
 * Total shares including boosts and bridged tokens
 * (For gov vaults this will be in deposit token since there are no shares)
 */
export const selectUserVaultBalanceInShareTokenIncludingBoostsBridged: UserBalanceSelector =
  createCachedSelector(
    (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
      selectUserVaultBalanceInShareToken(state, vaultId, maybeWalletAddress),
    (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
      selectUserVaultBalanceInShareTokenInBoosts(state, vaultId, maybeWalletAddress),
    (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
      selectUserVaultBalanceInShareTokenInBridged(state, vaultId, maybeWalletAddress),
    (base, boosts, bridged) => base.plus(boosts).plus(bridged)
  )((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Balance converted to deposit token, excluding in boosts and bridged tokens
 */
export const selectUserVaultBalanceInDepositToken: UserBalanceSelector = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareToken(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultPricePerFullShare(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectDepositTokenByVaultId(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectShareTokenByVaultId(state, vaultId),
  (shares, ppfs, depositToken, shareToken) =>
    shareToken ? mooAmountToOracleAmount(shareToken, depositToken, ppfs, shares) : shares
)((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Balance converted to deposit token, including in boosts and bridged tokens
 */
export const selectUserVaultBalanceInDepositTokenIncludingBoostsBridged: UserBalanceSelector =
  createCachedSelector(
    (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
      selectUserVaultBalanceInShareTokenIncludingBoostsBridged(state, vaultId, maybeWalletAddress),
    (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultPricePerFullShare(state, vaultId),
    (state: BeefyState, vaultId: VaultEntity['id']) => selectDepositTokenByVaultId(state, vaultId),
    (state: BeefyState, vaultId: VaultEntity['id']) => selectShareTokenByVaultId(state, vaultId),
    (shares, ppfs, depositToken, shareToken) =>
      shareToken ? mooAmountToOracleAmount(shareToken, depositToken, ppfs, shares) : shares
  )((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Balance converted to deposit token, excluding in boosts and bridged tokens
 * @returns {TokenAmount} token: deposit token, amount: balance in deposit token
 */
export const selectUserVaultBalanceInDepositTokenWithToken: UserBalanceWithTokenSelector =
  createCachedSelector(
    (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
      selectUserVaultBalanceInShareToken(state, vaultId, maybeWalletAddress),
    (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultPricePerFullShare(state, vaultId),
    (state: BeefyState, vaultId: VaultEntity['id']) => selectDepositTokenByVaultId(state, vaultId),
    (state: BeefyState, vaultId: VaultEntity['id']) => selectShareTokenByVaultId(state, vaultId),
    (shares, ppfs, depositToken, shareToken) => ({
      token: depositToken,
      amount: shareToken ? mooAmountToOracleAmount(shareToken, depositToken, ppfs, shares) : shares,
    })
  )((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Balance converted to deposit token, including in boosts and bridged tokens
 * @returns {TokenAmount} token: deposit token, amount: balance in deposit token
 */
export const selectUserVaultBalanceInDepositTokenIncludingBoostsBridgedWithToken: UserBalanceWithTokenSelector =
  createCachedSelector(
    (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
      selectUserVaultBalanceInShareTokenIncludingBoostsBridged(state, vaultId, maybeWalletAddress),
    (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultPricePerFullShare(state, vaultId),
    (state: BeefyState, vaultId: VaultEntity['id']) => selectDepositTokenByVaultId(state, vaultId),
    (state: BeefyState, vaultId: VaultEntity['id']) => selectShareTokenByVaultId(state, vaultId),
    (shares, ppfs, depositToken, shareToken) => ({
      token: depositToken,
      amount: shareToken ? mooAmountToOracleAmount(shareToken, depositToken, ppfs, shares) : shares,
    })
  )((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

export type StandardVaultBalanceBreakdownVault = {
  type: 'vault';
  id: string;
  amount: BigNumber;
  vaultId: VaultEntity['id'];
};
export type StandardVaultBalanceBreakdownBoost = {
  type: 'boost';
  id: string;
  amount: BigNumber;
  boostId: BoostEntity['id'];
};
export type StandardVaultBalanceBreakdownBridged = {
  type: 'bridged';
  id: string;
  amount: BigNumber;
  chainId: ChainEntity['id'];
};
export type StandardVaultBalanceBreakdownEntry =
  | StandardVaultBalanceBreakdownVault
  | StandardVaultBalanceBreakdownBoost
  | StandardVaultBalanceBreakdownBridged;
export type StandardVaultBalanceBreakdown = StandardVaultBalanceBreakdownEntry[];

export const selectStandardVaultUserBalanceInDepositTokenBreakdown = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): StandardVaultBalanceBreakdown => {
  const vault = selectStandardVaultById(state, vaultId);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const mooToken = selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
  const ppfs = selectVaultPricePerFullShare(state, vault.id);
  const balances: StandardVaultBalanceBreakdown = [];

  // direct deposit in vault
  const mooTokenBalance = selectUserBalanceOfToken(
    state,
    vault.chainId,
    mooToken.address,
    walletAddress
  );

  if (mooTokenBalance.gt(BIG_ZERO)) {
    balances.push({
      type: 'vault',
      id: `vault-${vaultId}`,
      vaultId,
      amount: mooAmountToOracleAmount(mooToken, depositToken, ppfs, mooTokenBalance),
    });
  }

  // deposits in boost (even those expired)
  const boostIds = selectAllVaultBoostIds(state, vaultId);
  for (const boostId of boostIds) {
    const boostMooToken = selectBoostUserBalanceInToken(state, boostId, walletAddress);
    if (boostMooToken.gt(BIG_ZERO)) {
      balances.push({
        type: 'boost',
        id: `boost-${boostId}}`,
        boostId,
        amount: mooAmountToOracleAmount(mooToken, depositToken, ppfs, boostMooToken),
      });
    }
  }

  // bridged mooToken

  if (!isGovVault(vault) && vault.bridged) {
    for (const [chainId, tokenAddress] of entries(vault.bridged)) {
      const bridgedMooToken = selectUserBalanceOfToken(state, chainId, tokenAddress, walletAddress);
      if (bridgedMooToken.gt(BIG_ZERO)) {
        balances.push({
          type: 'bridged',
          id: `bridged-${chainId}`,
          chainId,
          amount: mooAmountToOracleAmount(mooToken, depositToken, ppfs, bridgedMooToken),
        });
      }
    }
  }

  return balances;
};

export const selectGovVaultUserStakedBalanceInDepositToken = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount.byGovVaultId[vaultId]?.balance || BIG_ZERO;
};

export const selectBoostUserBalanceInToken = (
  state: BeefyState,
  boostId: BoostEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount?.byBoostId[boostId]?.balance || BIG_ZERO;
};

export const selectBoostUserRewardsInToken = (
  state: BeefyState,
  boostId: BoostEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount?.byBoostId[boostId]?.rewards || BIG_ZERO;
};

/**
 * Vault balance converted to USD, including in boosts and bridged tokens
 */
export const selectUserVaultBalanceInUsdIncludingBoostsBridged = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  const vaultTokenDeposit = selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(
    state,
    vaultId,
    walletAddress
  );

  return vaultTokenDeposit.multipliedBy(oraclePrice);
};

/**
 * Balance of vault deposit token in users wallet converted to USD
 */
export const selectUserVaultDepositTokenWalletBalanceInUsd = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  const walletBalance = selectUserBalanceOfToken(
    state,
    vault.chainId,
    vault.depositTokenAddress,
    walletAddress
  );

  return walletBalance.multipliedBy(oraclePrice);
};

/** @deprecated */
export const selectGovVaultPendingRewardsInToken = (
  state: BeefyState,
  vaultId: VaultGov['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount.byGovVaultId[vaultId]?.rewards[0] || BIG_ZERO; // TODO: support multiple rewards [empty = ok, only caller not used when clm-like]
};

/** @deprecated */
export const selectGovVaultPendingRewardsInUsd = (
  state: BeefyState,
  vaultId: VaultGov['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId) as VaultGov;
  const tokenRewards = selectGovVaultPendingRewardsInToken(state, vaultId, walletAddress);
  const tokenPrice = selectTokenPriceByAddress(state, vault.chainId, vault.earnedTokenAddresses[0]); // TODO: support multiple rewards [empty = ok, only caller not used when clm-like]
  return tokenRewards.times(tokenPrice);
};

/** @dev will NOT default to connected wallet address */
export const selectGovVaultPendingRewards = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress?: string) =>
    selectVaultById(state, vaultId),
  (state: BeefyState, _vaultId: VaultEntity['id'], _walletAddress?: string) =>
    state.entities.tokens.byChainId,
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string) =>
    walletAddress
      ? state.user.balance.byAddress[walletAddress]?.tokenAmount.byGovVaultId[vaultId]?.rewards
      : undefined,
  (vault, tokensByChain, rewards) => {
    if (!isGovVault(vault) || !rewards) {
      return [];
    }

    return vault.earnedTokenAddresses.map((address, i) => {
      const token = tokensByChain[vault.chainId]?.byAddress?.[address.toLowerCase()];
      if (!token) {
        throw new Error(`selectGovVaultEarnedTokens: Unknown token address ${address}`);
      }

      const balance = rewards?.[i] || BIG_ZERO;
      return {
        token,
        balance,
      };
    });
  }
);

/** @dev will NOT default to connected wallet address */
export const selectGovVaultPendingRewardsWithPrice = createSelector(
  selectGovVaultPendingRewards,
  (state: BeefyState, _vaultId: VaultEntity['id'], _walletAddress?: string) =>
    state.entities.tokens.prices.byOracleId,
  (rewards, prices) => {
    return rewards.map(reward => ({
      ...reward,
      price: prices[reward.token.oracleId] || undefined,
    }));
  }
);

/**
 * Get the token for which the boost balance is expressed in
 * for boosts, balance is the amount of earnedToken of the target vault
 */
export const selectBoostBalanceTokenEntity = (state: BeefyState, boostId: BoostEntity['id']) => {
  const boost = selectBoostById(state, boostId);
  const boostedVault = selectVaultById(state, boost.vaultId);
  return selectTokenByAddress(state, boostedVault.chainId, boostedVault.contractAddress);
};

/**
 * Get the token for which the boost rewards are expressed in
 * for boosts, rewards is the amount of earnedToken of the boost
 */
export const selectBoostRewardsTokenEntity = (state: BeefyState, boostId: BoostEntity['id']) => {
  const boost = selectBoostById(state, boostId);
  return selectTokenByAddress(state, boost.chainId, boost.earnedTokenAddress);
};

/**
 * Get the token for which the gov vault balance is expressed in
 * for gov vault, balance is the amount of oracleId token
 */
export const selectGovVaultBalanceTokenEntity = (state: BeefyState, vaultId: VaultGov['id']) => {
  const vault = selectVaultById(state, vaultId);
  return selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
};

/**
 * Get the token for which the gov vault rewards are expressed in
 * for gov vault, rewards is an amount in earnedTokenId
 */
export const selectGovVaultRewardsTokenEntity = (state: BeefyState, vaultId: VaultGov['id']) => {
  const vault = selectGovVaultById(state, vaultId);
  return selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddresses[0]); // TODO: support multiple rewards [empty ok, only called in v1 govVaultFormatter]
};

export const selectLpBreakdownBalance = (
  state: BeefyState,
  breakdown: TokenLpBreakdown,
  balance: BigNumber,
  chainId: ChainEntity['id']
) => {
  const lpTotalSupplyDecimal = new BigNumber(breakdown.totalSupply);
  const userShareOfPool = balance.dividedBy(lpTotalSupplyDecimal);
  const assets = breakdown.tokens.map((tokenAddress, i) => {
    const reserves = new BigNumber(breakdown.balances[i]);
    const assetToken = selectTokenByAddress(state, chainId, tokenAddress);
    const valuePerDecimal = selectTokenPriceByAddress(state, chainId, tokenAddress);
    const totalValue = reserves.multipliedBy(valuePerDecimal);

    return {
      ...assetToken,
      totalAmount: reserves,
      userAmount: userShareOfPool.multipliedBy(reserves),
      totalValue,
      userValue: userShareOfPool.multipliedBy(totalValue),
      price: valuePerDecimal,
    };
  });

  return { assets, userShareOfPool, lpTotalSupplyDecimal };
};

export const selectTreasuryV3PositionBreakdown = (
  state: BeefyState,
  breakdown: TokenLpBreakdown,
  chainId: ChainEntity['id']
) => {
  const assets = breakdown.tokens.map((tokenAddress, i) => {
    const assetToken = selectTokenByAddress(state, chainId, tokenAddress);
    return {
      ...assetToken,
      userValue: breakdown.balances[i],
    };
  });

  return { assets };
};

export const selectUserLpBreakdownBalance = (
  state: BeefyState,
  vault: VaultEntity,
  breakdown: TokenLpBreakdown,
  walletAddress?: string
): UserLpBreakdownBalance => {
  const lpTotalSupplyDecimal = new BigNumber(breakdown.totalSupply);
  const underlyingTotalSupplyDecimal =
    breakdown && 'underlyingLiquidity' in breakdown
      ? new BigNumber(breakdown.underlyingLiquidity || 0)
      : BIG_ZERO;

  // TODO what about when there is standard vaults?
  const relatedVault = isCowcentratedGovVault(vault)
    ? vault.cowcentratedId
    : isCowcentratedVault(vault)
    ? vault.cowcentratedGovId
    : undefined;

  const relatedBalanceDecimal = relatedVault
    ? selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(state, relatedVault, walletAddress)
    : BIG_ZERO;

  const userBalanceDecimal = selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(
    state,
    vault.id,
    walletAddress
  ).plus(relatedBalanceDecimal);

  const userShareOfPool = lpTotalSupplyDecimal.gt(BIG_ZERO)
    ? userBalanceDecimal.dividedBy(lpTotalSupplyDecimal)
    : BIG_ZERO;

  const oneLpShareOfPool = lpTotalSupplyDecimal.gt(BIG_ZERO)
    ? BIG_ONE.dividedBy(lpTotalSupplyDecimal)
    : BIG_ZERO;

  const underlyingShareOfPool = underlyingTotalSupplyDecimal.gt(BIG_ZERO)
    ? underlyingTotalSupplyDecimal.dividedBy(underlyingTotalSupplyDecimal)
    : BIG_ZERO;

  const assets = breakdown.tokens.map((tokenAddress, i) => {
    const reserves = new BigNumber(breakdown.balances[i]);
    const underlyingReserves =
      breakdown && 'underlyingBalances' in breakdown
        ? new BigNumber(breakdown.underlyingBalances[i] || 0)
        : BIG_ZERO;
    const assetToken = selectTokenByAddress(state, vault.chainId, tokenAddress);
    const valuePerDecimal = selectTokenPriceByAddress(state, vault.chainId, tokenAddress);
    const totalValue = reserves.multipliedBy(valuePerDecimal);
    const totalUnderlyingValue = underlyingReserves.multipliedBy(valuePerDecimal);

    return {
      ...assetToken,
      totalAmount: reserves,
      userAmount: userShareOfPool.multipliedBy(reserves),
      oneAmount: oneLpShareOfPool.multipliedBy(reserves),
      underlyingAmount: underlyingShareOfPool.multipliedBy(underlyingReserves),
      totalValue,
      totalUnderlyingValue,
      userValue: userShareOfPool.multipliedBy(totalValue),
      oneValue: oneLpShareOfPool.multipliedBy(totalValue),
      underlyingValue: underlyingShareOfPool.multipliedBy(totalUnderlyingValue),
      price: valuePerDecimal,
    };
  });

  return {
    assets,
    userShareOfPool,
    lpTotalSupplyDecimal,
    userBalanceDecimal,
    oneLpShareOfPool,
    underlyingTotalSupplyDecimal,
    underlyingShareOfPool,
  };
};

type UserExposureVaultEntry = { key: string; label: string; value: BigNumber };
type UserExposureVaultFn<T extends UserExposureVaultEntry = UserExposureVaultEntry> = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  vaultTvl: BigNumber,
  walletAddress: string
) => T[];
type UserExposureEntry<T extends UserExposureVaultEntry = UserExposureVaultEntry> = T & {
  percentage: number;
};
type UserExposureSummarizer<T extends UserExposureVaultEntry = UserExposureVaultEntry> = (
  entries: UserExposureEntry<T>[]
) => UserExposureEntry<T>[];

type UserTokenExposureVaultEntry = UserExposureVaultEntry & {
  symbols: string[];
  chainId: ChainEntity['id'];
};

type UserChainExposureVaultEntry = UserExposureVaultEntry & {
  chainId: ChainEntity['id'] | 'others';
};

const top6ByPercentageSummarizer = <T extends UserExposureVaultEntry = UserExposureVaultEntry>(
  entries: UserExposureEntry<T>[]
) =>
  getTopNArray(entries, 'percentage', 6, {
    key: 'others',
    label: 'Others',
    value: BIG_ZERO,
    percentage: 0,
  });

const stableVsOthersSummarizer = (entries: UserExposureEntry[]) => orderBy(entries, 'key', 'desc');

const selectUserExposure = <T extends UserExposureVaultEntry = UserExposureVaultEntry>(
  state: BeefyState,
  vaultFn: UserExposureVaultFn<T>,
  summarizerFn: UserExposureSummarizer<T>,
  maybeWalletAddress?: string
): UserExposureEntry<T>[] => {
  const walletAddress = maybeWalletAddress || selectWalletAddressIfKnown(state);
  if (!walletAddress) {
    return [];
  }

  const vaultIds = selectUserDepositedVaultIds(state, walletAddress);
  if (!vaultIds.length) {
    return [];
  }

  const vaultDeposits = vaultIds.map(vaultId =>
    selectUserVaultBalanceInUsdIncludingBoostsBridged(state, vaultId, walletAddress)
  );
  const totalDeposits = vaultDeposits.reduce((acc, deposit) => acc.plus(deposit), BIG_ZERO);
  const entries = vaultIds
    .map((vaultId, i) => vaultFn(state, vaultId, vaultDeposits[i], walletAddress))
    .flat();
  const byKey = entries.reduce((acc, entry) => {
    if (!acc[entry.key]) {
      acc[entry.key] = entry;
    } else {
      acc[entry.key].value = acc[entry.key].value.plus(entry.value);
    }
    return acc;
  }, {} as Record<UserExposureVaultEntry['key'], T>);

  const entriesWithPercentage = Object.values(byKey).map(entry => ({
    ...entry,
    percentage: entry.value.dividedBy(totalDeposits).toNumber(),
  }));

  return summarizerFn(entriesWithPercentage);
};

const selectUserVaultChainExposure: UserExposureVaultFn<UserChainExposureVaultEntry> = (
  state,
  vaultId,
  vaultTvl,
  _walletAddress
) => {
  const vault = selectVaultById(state, vaultId);
  const chain = selectChainById(state, vault.chainId);
  return [{ key: chain.id, label: chain.name, value: vaultTvl, chainId: chain.id }];
};

export const selectUserExposureByChain = (state: BeefyState, walletAddress?: string) =>
  selectUserExposure(
    state,
    selectUserVaultChainExposure,
    entries =>
      getTopNArray(entries, 'percentage', 6, {
        key: 'others',
        label: 'Others',
        value: BIG_ZERO,
        percentage: 0,
        chainId: 'others' as const,
      }),
    walletAddress
  );

const selectUserVaultPlatformExposure: UserExposureVaultFn = (
  state,
  vaultId,
  vaultTvl,
  _walletAddress
) => {
  const vault = selectVaultById(state, vaultId);
  const platform = selectPlatformById(state, vault.platformId);
  return [{ key: platform.id, label: platform.name, value: vaultTvl }];
};

export const selectUserExposureByPlatform = (state: BeefyState, walletAddress?: string) =>
  selectUserExposure(
    state,
    selectUserVaultPlatformExposure,
    top6ByPercentageSummarizer,
    walletAddress
  );

const selectUserVaultTokenExposure: UserExposureVaultFn<UserTokenExposureVaultEntry> = (
  state,
  vaultId,
  vaultTvl,
  walletAddress
): UserTokenExposureVaultEntry[] => {
  const vault = selectVaultById(state, vaultId);

  if (vault.assetIds.length === 1) {
    const token = selectTokenByIdOrUndefined(state, vault.chainId, vault.assetIds[0]);
    const symbol = selectWrappedToNativeSymbolOrTokenSymbol(
      state,
      token ? token.symbol : vault.assetIds[0]
    );
    return [
      { key: symbol, label: symbol, value: vaultTvl, symbols: [symbol], chainId: vault.chainId },
    ];
  }

  const haveBreakdownData = selectHasBreakdownDataByTokenAddress(
    state,
    vault.depositTokenAddress,
    vault.chainId
  );
  if (haveBreakdownData) {
    const breakdown = selectLpBreakdownForVault(state, vault);
    const { assets } = selectUserLpBreakdownBalance(state, vault, breakdown, walletAddress);
    return assets.map(asset => {
      const symbol = selectWrappedToNativeSymbolOrTokenSymbol(state, asset.symbol);
      return {
        key: symbol,
        label: symbol,
        value: asset.userValue,
        symbols: [symbol],
        chainId: vault.chainId,
      };
    });
  }

  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const symbols = selectVaultTokenSymbols(state, vaultId);
  return [
    {
      key: depositToken.symbol,
      label: depositToken.symbol,
      value: vaultTvl,
      symbols,
      chainId: vault.chainId,
    },
  ];
};

export const selectUserExposureByToken = (state: BeefyState, walletAddress?: string) =>
  selectUserExposure(
    state,
    selectUserVaultTokenExposure,
    entries =>
      getTopNArray(entries, 'percentage', 6, {
        key: 'others',
        label: 'Others',
        value: BIG_ZERO,
        percentage: 0,
        symbols: [],
        chainId: 'ethereum',
      }),
    walletAddress
  );

const selectUserVaultStableExposure: UserExposureVaultFn = (
  state,
  vaultId,
  vaultTvl,
  walletAddress
) => {
  if (selectIsVaultStable(state, vaultId)) {
    return [{ key: 'stable', label: 'Stable', value: vaultTvl }];
  }

  const vault = selectVaultById(state, vaultId);
  const haveBreakdownData = selectHasBreakdownDataByTokenAddress(
    state,
    vault.depositTokenAddress,
    vault.chainId
  );
  if (haveBreakdownData) {
    const breakdown = selectLpBreakdownForVault(state, vault);
    const { assets } = selectUserLpBreakdownBalance(state, vault, breakdown, walletAddress);
    return assets.map(asset => {
      const isStable = selectIsTokenStable(state, asset.chainId, asset.id);
      return {
        key: isStable ? 'stable' : 'other',
        label: isStable ? 'Stable' : 'Other',
        value: asset.userValue,
      };
    });
  }

  return [{ key: 'other', label: 'Other', value: vaultTvl }];
};

export const selectUserStablecoinsExposure = (state: BeefyState, walletAddress?: string) =>
  selectUserExposure(state, selectUserVaultStableExposure, stableVsOthersSummarizer, walletAddress);

export const selectUserVaultBalances = (state: BeefyState) => {
  const userVaults = selectUserDepositedVaultIds(state);
  const result = userVaults.reduce((totals, vaultId) => {
    const vault = selectVaultById(state, vaultId);
    const chainId = vault.chainId;
    const vaults = totals[chainId]?.vaults || [];
    vaults.push(vault);
    const depositedByChain = (totals[chainId]?.depositedByChain || BIG_ZERO).plus(
      selectUserVaultBalanceInUsdIncludingBoostsBridged(state, vaultId)
    );
    totals[chainId] = {
      chainId,
      vaults,
      depositedByChain,
    };
    return totals;
  }, {} as Record<string, { vaults: VaultEntity[]; depositedByChain: BigNumber; chainId: ChainEntity['id'] }>);

  return Object.values(result).sort((a, b) => {
    return a.depositedByChain.gte(b.depositedByChain) ? -1 : 1;
  });
};

export const selectUserVaultsPnl = (state: BeefyState, walletAddress?: string) => {
  const userVaults = selectUserDepositedVaultIds(state, walletAddress);
  const vaults: Record<string, UserVaultPnl> = {};
  for (const vaultId of userVaults) {
    vaults[vaultId] = selectVaultPnl(state, vaultId, walletAddress);
  }
  return vaults;
};

export const selectUserTotalYieldUsd = (state: BeefyState, walletAddress?: string) => {
  const vaultPnls = selectUserVaultsPnl(state, walletAddress);

  let totalYieldUsd = BIG_ZERO;
  for (const vaultPnl of Object.values(vaultPnls)) {
    totalYieldUsd = totalYieldUsd.plus(
      isUserClmPnl(vaultPnl) ? vaultPnl.totalCompoundedUsd : vaultPnl.totalYieldUsd
    );
  }

  return totalYieldUsd;
};

export const selectUserRewardsByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  walletAddress = walletAddress || selectWalletAddress(state);

  const rewards: {
    rewardToken: TokenEntity['symbol'];
    rewardTokenDecimals: TokenEntity['decimals'];
    rewards: BigNumber;
    rewardsUsd: BigNumber;
  }[] = [];
  const rewardsTokens: string[] = [];
  let totalRewardsUsd = BIG_ZERO;

  if (!walletAddress) {
    return { rewards, rewardsTokens, totalRewardsUsd };
  }

  const vault = selectVaultById(state, vaultId);

  if (isGovVault(vault)) {
    const pendingRewards = selectGovVaultPendingRewardsWithPrice(state, vault.id, walletAddress);
    for (const pendingReward of pendingRewards) {
      const tokenRewardsUsd = pendingReward.balance.times(pendingReward.price || BIG_ZERO);

      totalRewardsUsd = totalRewardsUsd.plus(tokenRewardsUsd);
      rewardsTokens.push(pendingReward.token.symbol);

      rewards.push({
        rewardToken: pendingReward.token.symbol,
        rewardTokenDecimals: pendingReward.token.decimals,
        rewards: pendingReward.balance,
        rewardsUsd: tokenRewardsUsd,
      });
    }
  } else {
    const boosts = selectAllVaultBoostIds(state, vaultId);
    for (const boostId of boosts) {
      const boostPendingRewards = selectBoostUserRewardsInToken(state, boostId, walletAddress);
      if (boostPendingRewards.isGreaterThan(BIG_ZERO)) {
        const rewardToken = selectBoostRewardsTokenEntity(state, boostId);
        const oraclePrice = selectTokenPriceByTokenOracleId(state, rewardToken.oracleId);
        const tokenRewardsUsd = boostPendingRewards.times(oraclePrice);

        rewardsTokens.push(rewardToken.symbol);
        totalRewardsUsd = totalRewardsUsd.plus(tokenRewardsUsd);

        rewards.push({
          rewardToken: rewardToken.symbol,
          rewardTokenDecimals: rewardToken.decimals,
          rewards: boostPendingRewards,
          rewardsUsd: tokenRewardsUsd,
        });
      }
    }
  }

  return { rewards, rewardsTokens, totalRewardsUsd };
};

export const selectUserUnstakedCowcentratedVaultIds = createSelector(
  (state: BeefyState, walletAddress?: string) => _selectWalletBalance(state, walletAddress),
  (state: BeefyState) => state.entities.vaults.byId,
  (userBalance, vaultsById) => {
    if (!userBalance || userBalance.depositedVaultIds.length === 0) {
      return [];
    }
    return userBalance.depositedVaultIds
      .map(vaultId => vaultsById[vaultId])
      .filter(isCowcentratedVault)
      .filter(
        vault =>
          isCowcentratedVault(vault) &&
          (vault.cowcentratedGovId || vault.cowcentratedStandardId) &&
          userBalance.tokenAmount.byChainId[vault.chainId]?.byTokenAddress[
            vault.receiptTokenAddress.toLowerCase()
          ]?.balance.gt(BIG_ZERO)
      )
      .map(vault => vault.id);
  }
);

export const selectUserShouldStakeForVault = createSelector(
  (state: BeefyState, _vaultId: string, walletAddress?: string) =>
    _selectWalletBalance(state, walletAddress),
  (state: BeefyState, vaultId: string) => selectVaultById(state, vaultId),
  (
    userBalance,
    vault
  ): false | { type: 'gov' | 'standard'; id: string; cowcentratedId: string } => {
    if (!userBalance || !vault || !isCowcentratedLikeVault(vault)) {
      return false;
    }
    if (!vault.cowcentratedGovId && !vault.cowcentratedStandardId) {
      return false;
    }

    const clmReceiptTokenAddress =
      vault.id === vault.cowcentratedId ? vault.receiptTokenAddress : vault.depositTokenAddress;
    const hasClmBalance =
      userBalance.tokenAmount.byChainId[vault.chainId]?.byTokenAddress[
        clmReceiptTokenAddress.toLowerCase()
      ]?.balance.gt(BIG_ZERO) || false;

    if (!hasClmBalance) {
      return false;
    }

    if (vault.cowcentratedGovId) {
      return { type: 'gov', id: vault.cowcentratedGovId, cowcentratedId: vault.cowcentratedId };
    }

    return {
      type: 'standard',
      id: vault.cowcentratedStandardId!,
      cowcentratedId: vault.cowcentratedId,
    };
  }
);
