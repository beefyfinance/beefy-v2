import { mooAmountToOracleAmount } from '../utils/ppfs';
import type { BeefyState } from '../../../redux-types';
import type { BoostEntity } from '../entities/boost';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity, TokenLpBreakdown } from '../entities/token';
import {
  isCowcentratedGovVault,
  isCowcentratedVault,
  isGovVault,
  isGovVaultMulti,
  isGovVaultSingle,
  isStandardVault,
  type VaultEntity,
  type VaultGov,
} from '../entities/vault';
import { selectAllVaultBoostIds, selectBoostById } from './boosts';
import { createCachedSelector } from 're-reselect';
import {
  selectHasBreakdownDataByTokenAddress,
  selectIsTokenStable,
  selectLpBreakdownForVault,
  selectTokenByAddress,
  selectTokenByIdOrUndefined,
  selectTokenPriceByAddress,
  selectTokenPriceByTokenOracleId,
  selectTokensByChainId,
  selectVaultTokenSymbols,
  selectWrappedToNativeSymbolOrTokenSymbol,
} from './tokens';
import { selectGovVaultById, selectIsVaultStable, selectVaultById } from './vaults';
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

/**
 * Only includes bare CLM in wallet if vault is CLM Pool
 */
export const selectUserVaultBalanceInShareTokenInUnderlyingCLM = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  maybeWalletAddress?: string
) => {
  const walletAddress = maybeWalletAddress || selectWalletAddress(state);
  if (!walletAddress) {
    return BIG_ZERO;
  }

  const vault = selectVaultById(state, vaultId);
  if (!isCowcentratedGovVault(vault)) {
    return BIG_ZERO;
  }

  return selectUserBalanceOfToken(state, vault.chainId, vault.depositTokenAddress, walletAddress);
};

const selectVaultSharesToDepositTokenData = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.vaults.contractData.byVaultId[vaultId]?.pricePerFullShare,
  (state: BeefyState, _vaultId: VaultEntity['id']) => state.entities.tokens.byChainId,
  (vault, ppfs, tokensByChainId) => {
    const depositToken =
      tokensByChainId[vault.chainId]?.byAddress[vault.depositTokenAddress.toLowerCase()];
    if (!depositToken) {
      throw new Error(`Deposit token not found for ${vault.id}`);
    }

    // only standard vaults have ppfs
    if (isStandardVault(vault)) {
      if (!ppfs) {
        throw new Error(`Price per full share not found for ${vault.id}`);
      }
      const shareToken =
        tokensByChainId[vault.chainId]?.byAddress[vault.receiptTokenAddress.toLowerCase()];
      if (!shareToken) {
        throw new Error(`Share token not found for ${vault.id}`);
      }

      return {
        ppfs,
        shareToken,
        depositToken,
      };
    }

    return {
      depositToken,
    };
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

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
    (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
      selectUserVaultBalanceInShareTokenInUnderlyingCLM(state, vaultId, maybeWalletAddress),
    (...balances) => balances.reduce((acc, balance) => acc.plus(balance), BIG_ZERO)
  )((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Balance converted to deposit token, excluding in boosts and bridged tokens
 */
export const selectUserVaultBalanceInDepositToken: UserBalanceSelector = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareToken(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectVaultSharesToDepositTokenData(state, vaultId),
  (shares, shareData) =>
    shareData.shareToken
      ? mooAmountToOracleAmount(
          shareData.shareToken,
          shareData.depositToken,
          shareData.ppfs,
          shares
        )
      : shares
)((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Balance converted to deposit token, including in boosts and bridged tokens
 */
export const selectUserVaultBalanceInDepositTokenIncludingBoostsBridged: UserBalanceSelector =
  createCachedSelector(
    (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
      selectUserVaultBalanceInShareTokenIncludingBoostsBridged(state, vaultId, maybeWalletAddress),
    (state: BeefyState, vaultId: VaultEntity['id']) =>
      selectVaultSharesToDepositTokenData(state, vaultId),
    (shares, shareData) =>
      shareData.shareToken
        ? mooAmountToOracleAmount(
            shareData.shareToken,
            shareData.depositToken,
            shareData.ppfs,
            shares
          )
        : shares
  )((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Balance converted to deposit token, excluding in boosts and bridged tokens
 * @returns {TokenAmount} token: deposit token, amount: balance in deposit token
 */
export const selectUserVaultBalanceInDepositTokenWithToken: UserBalanceWithTokenSelector =
  createCachedSelector(
    (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
      selectUserVaultBalanceInShareToken(state, vaultId, maybeWalletAddress),
    (state: BeefyState, vaultId: VaultEntity['id']) =>
      selectVaultSharesToDepositTokenData(state, vaultId),
    (shares, shareData) => ({
      token: shareData.depositToken,
      amount: shareData.shareToken
        ? mooAmountToOracleAmount(
            shareData.shareToken,
            shareData.depositToken,
            shareData.ppfs,
            shares
          )
        : shares,
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
    (state: BeefyState, vaultId: VaultEntity['id']) =>
      selectVaultSharesToDepositTokenData(state, vaultId),
    (shares, shareData) => ({
      token: shareData.depositToken,
      amount: shareData.shareToken
        ? mooAmountToOracleAmount(
            shareData.shareToken,
            shareData.depositToken,
            shareData.ppfs,
            shares
          )
        : shares,
    })
  )((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

export type UserVaultBalanceBreakdownVault = {
  type: 'vault';
  id: string;
  amount: BigNumber;
  vaultId: VaultEntity['id'];
};
export type UserVaultBalanceBreakdownBoost = {
  type: 'boost';
  id: string;
  amount: BigNumber;
  boostId: BoostEntity['id'];
};
export type UserVaultBalanceBreakdownBridged = {
  type: 'bridged';
  id: string;
  amount: BigNumber;
  chainId: ChainEntity['id'];
};
export type UserVaultBalanceBreakdownCLM = {
  type: 'clm';
  id: string;
  amount: BigNumber;
  chainId: ChainEntity['id'];
};

export type UserVaultBalanceBreakdownEntry =
  | UserVaultBalanceBreakdownVault
  | UserVaultBalanceBreakdownBoost
  | UserVaultBalanceBreakdownBridged
  | UserVaultBalanceBreakdownCLM;

export type UserVaultBalanceBreakdown = {
  depositToken: TokenEntity;
  entries: UserVaultBalanceBreakdownEntry[];
};

export const selectVaultUserBalanceInDepositTokenBreakdown = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): UserVaultBalanceBreakdown => {
  const vault = selectVaultById(state, vaultId);
  const shareData = selectVaultSharesToDepositTokenData(state, vaultId);
  const vaultBalance = selectUserVaultBalanceInDepositToken(state, vaultId);
  const balances: UserVaultBalanceBreakdown = {
    depositToken: shareData.depositToken,
    entries: [],
  };

  if (vaultBalance.gt(BIG_ZERO)) {
    balances.entries.push({
      type: 'vault',
      id: `vault-${vaultId}`,
      vaultId,
      amount: vaultBalance,
    });
  }

  // normal gov vaults do not have balances elsewhere
  if (isGovVault(vault) && !isCowcentratedGovVault(vault)) {
    return balances;
  }

  // only gov vaults count CLM in wallet
  if (isCowcentratedGovVault(vault)) {
    const clmBalance = selectUserVaultBalanceInShareTokenInUnderlyingCLM(
      state,
      vaultId,
      walletAddress
    );
    if (clmBalance.gt(BIG_ZERO)) {
      balances.entries.push({
        type: 'clm',
        id: `clm-${vaultId}`,
        chainId: vault.chainId,
        amount: clmBalance,
      });
    }
  }

  // only standard vaults have boosts or bridged balances
  if (!isStandardVault(vault) || !shareData.shareToken) {
    return balances;
  }

  // deposits in boost (even those expired)
  const boostIds = selectAllVaultBoostIds(state, vaultId);
  for (const boostId of boostIds) {
    const boostShareBalance = selectBoostUserBalanceInToken(state, boostId, walletAddress);
    if (boostShareBalance.gt(BIG_ZERO)) {
      balances.entries.push({
        type: 'boost',
        id: `boost-${boostId}`,
        boostId,
        amount: mooAmountToOracleAmount(
          shareData.shareToken,
          shareData.depositToken,
          shareData.ppfs,
          boostShareBalance
        ),
      });
    }
  }

  // bridged mooToken
  if (vault.bridged) {
    for (const [chainId, tokenAddress] of entries(vault.bridged)) {
      const bridgedShareBalance = selectUserBalanceOfToken(
        state,
        chainId,
        tokenAddress,
        walletAddress
      );
      if (bridgedShareBalance.gt(BIG_ZERO)) {
        balances.entries.push({
          type: 'bridged',
          id: `bridged-${chainId}`,
          chainId,
          amount: mooAmountToOracleAmount(
            shareData.shareToken,
            shareData.depositToken,
            shareData.ppfs,
            bridgedShareBalance
          ),
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

  const userBalanceDecimal = selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(
    state,
    vault.id,
    walletAddress
  );

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

export const selectUserStablecoinsExposure = (state: BeefyState, walletAddress: string) =>
  selectUserExposure(state, selectUserVaultStableExposure, stableVsOthersSummarizer, walletAddress);

export const selectUserVaultsPnl = (state: BeefyState, walletAddress: string) => {
  const userVaults = selectUserDepositedVaultIds(state, walletAddress);
  const vaults: Record<string, UserVaultPnl> = {};
  for (const vaultId of userVaults) {
    vaults[vaultId] = selectVaultPnl(state, vaultId, walletAddress);
  }
  return vaults;
};

export const selectUserTotalYieldUsd = (state: BeefyState, walletAddress: string) => {
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

export const selectUserUnstakedCowcentratedGovVaultIds = createSelector(
  (state: BeefyState, walletAddress?: string) => _selectWalletBalance(state, walletAddress),
  (state: BeefyState) => state.entities.vaults.byId,
  (userBalance, vaultsById) => {
    if (!userBalance || userBalance.depositedVaultIds.length === 0) {
      return [];
    }
    return userBalance.depositedVaultIds
      .map(vaultId => vaultsById[vaultId]!)
      .filter(
        vault =>
          isCowcentratedGovVault(vault) &&
          userBalance.tokenAmount.byChainId[vault.chainId]?.byTokenAddress[
            vault.depositTokenAddress.toLowerCase()
          ]?.balance.gt(BIG_ZERO)
      )
      .map(vault => vault.id);
  }
);

export const selectUserIsUnstakedForVaultId = createSelector(
  (state: BeefyState, _vaultId: string, walletAddress?: string) =>
    _selectWalletBalance(state, walletAddress),
  (state: BeefyState, vaultId: string) => selectVaultById(state, vaultId),
  (userBalance, vault): boolean => {
    if (!userBalance || !vault || !isCowcentratedGovVault(vault)) {
      return false;
    }

    return (
      userBalance.tokenAmount.byChainId[vault.chainId]?.byTokenAddress[
        vault.depositTokenAddress.toLowerCase()
      ]?.balance.gt(BIG_ZERO) || false
    );
  }
);
