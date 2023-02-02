import { mooAmountToOracleAmount } from '../utils/ppfs';
import { BeefyState } from '../../../redux-types';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { TokenEntity, TokenLpBreakdown } from '../entities/token';
import { isGovVault, VaultEntity, VaultGov } from '../entities/vault';
import { selectActiveVaultBoostIds, selectAllVaultBoostIds, selectBoostById } from './boosts';
import createCachedSelector from 're-reselect';
import {
  selectHasBreakdownData,
  selectIsTokenStable,
  selectLpBreakdownByAddress,
  selectTokenByAddress,
  selectTokenPriceByAddress,
  selectTokensByChainId,
} from './tokens';
import {
  selectIsVaultStable,
  selectStandardVaultById,
  selectVaultById,
  selectVaultPricePerFullShare,
} from './vaults';
import { selectIsWalletKnown, selectWalletAddress, selectWalletAddressIfKnown } from './wallet';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number';
import BigNumber from 'bignumber.js';
import { KeysOfType } from '../utils/types-utils';
import { getTopNArray } from '../utils/array-utils';
import { sortBy } from 'lodash';
import { createSelector } from '@reduxjs/toolkit';
import { selectChainById } from './chains';

const _selectWalletBalance = (state: BeefyState, walletAddress?: string) => {
  if (selectIsWalletKnown(state)) {
    const userAddress = walletAddress || selectWalletAddress(state);
    if (!userAddress) {
      return null;
    }
    const walletBalance = state.user.balance.byAddress[userAddress.toLowerCase()];
    return walletBalance || null;
  } else {
    return null;
  }
};

export const selectAllTokenWhereUserCouldHaveBalance = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => selectTokensByChainId(state, chainId),
  tokens => tokens.interestingBalanceTokenAddresses
);

export const selectHasWalletBalanceBeenFetched = (state: BeefyState, walletAddress: string) => {
  return state.user.balance.byAddress[walletAddress.toLowerCase()] !== undefined;
};

export const selectUserDepositedVaultIds = (state: BeefyState) => {
  const walletBalance = _selectWalletBalance(state);
  return walletBalance?.depositedVaultIds || [];
};

export const selectAddressDepositedVaultIds = createSelector(
  (state: BeefyState, address: string) =>
    state.user.balance.byAddress[address.toLowerCase()]?.depositedVaultIds,
  maybeDepositedVaultIds => maybeDepositedVaultIds || []
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

export const selectTotalWalletBalanceInBoosts = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], userAddress: string) =>
    state.user.balance.byAddress[userAddress.toLowerCase()],
  (state: BeefyState, vaultId: VaultEntity['id']) => selectAllVaultBoostIds(state, vaultId),
  (walletBalance, boostIds) => {
    if (!boostIds.length || !walletBalance) {
      return BIG_ZERO;
    }

    const balances = boostIds.map(
      boostId => walletBalance.tokenAmount?.byBoostId[boostId]?.balance || BIG_ZERO
    );

    return BigNumber.sum(...balances);
  }
)(
  (state: BeefyState, vaultId: VaultEntity['id'], userAddress: string) =>
    `${vaultId}-${userAddress}`
);

/**
 * @dev Does not truncate decimals (needs vault deposit tokens decimals)
 */
export const selectTotalWalletBalanceInBoostsInDepositToken = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], userAddress: string) =>
    selectTotalWalletBalanceInBoosts(state, vaultId, userAddress),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultPricePerFullShare(state, vaultId),
  (mooBalance, ppfs) => mooBalance.multipliedBy(ppfs)
)(
  (state: BeefyState, vaultId: VaultEntity['id'], userAddress: string) =>
    `${vaultId}-${userAddress}`
);

export const selectTotalUserBalanceInBoostsInDepositToken = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const walletAddress = selectWalletAddressIfKnown(state);

  if (walletAddress) {
    return selectTotalWalletBalanceInBoostsInDepositToken(state, vaultId, walletAddress);
  }

  return BIG_ZERO;
};

export const selectIsUserEligibleForVault = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const walletBalance = _selectWalletBalance(state);
  return walletBalance ? walletBalance.eligibleVaultIds.indexOf(vaultId) !== -1 : false;
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
 * "User" balance refers to the balance displayed to the user
 * so we have to do the translation from earnedToken (mooToken) to depositToken
 * that the user deposited
 */
export const selectStandardVaultUserBalanceInDepositTokenExcludingBoosts = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectStandardVaultById(state, vaultId);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const mooToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
  const mooTokenBalance = selectUserBalanceOfToken(
    state,
    vault.chainId,
    mooToken.address,
    walletAddress
  );
  const ppfs = selectVaultPricePerFullShare(state, vault.id);
  return mooAmountToOracleAmount(mooToken, depositToken, ppfs, mooTokenBalance);
};

/**
 * "User" balance refers to the balance displayed to the user
 * so we have to do the translation from earnedToken (mooToken) to depositToken
 * that the user deposited
 */
export const selectStandardVaultUserBalanceInDepositTokenIncludingBoosts = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectStandardVaultById(state, vaultId);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const mooToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
  const ppfs = selectVaultPricePerFullShare(state, vault.id);

  // vault
  let mooTokenBalance = selectUserBalanceOfToken(
    state,
    vault.chainId,
    mooToken.address,
    walletAddress
  );

  // we also need to account for deposits in boost (even those expired)
  const boostIds = selectAllVaultBoostIds(state, vaultId);
  for (const boostId of boostIds) {
    const boostMooToken = selectBoostUserBalanceInToken(state, boostId, walletAddress);
    mooTokenBalance = mooTokenBalance.plus(boostMooToken);
  }

  return mooAmountToOracleAmount(mooToken, depositToken, ppfs, mooTokenBalance);
};

export const selectGovVaultUserStakedBalanceInDepositToken = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount.byGovVaultId[vaultId]?.balance || BIG_ZERO;
};

export const selectUserVaultDepositInDepositToken = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  if (isGovVault(vault)) {
    return selectGovVaultUserStakedBalanceInDepositToken(state, vaultId, walletAddress);
  } else {
    return selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(
      state,
      vaultId,
      walletAddress
    );
  }
};

export const selectUserVaultDepositInDepositTokenExcludingBoosts = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  if (isGovVault(vault)) {
    return selectGovVaultUserStakedBalanceInDepositToken(state, vaultId, walletAddress);
  } else {
    return selectStandardVaultUserBalanceInDepositTokenExcludingBoosts(
      state,
      vaultId,
      walletAddress
    );
  }
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

export const selectUserVaultDepositInUsd = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  // TODO: do this in the state?
  const vault = selectVaultById(state, vaultId);
  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  const vaultTokenDeposit = selectUserVaultDepositInDepositToken(state, vaultId, walletAddress);

  return vaultTokenDeposit.multipliedBy(oraclePrice);
};

export const selectTotalUserDepositInUsd = (state: BeefyState) => {
  const vaultIds = selectUserDepositedVaultIds(state);
  let total = BIG_ZERO;
  for (const vaultId of vaultIds) {
    total = total.plus(selectUserVaultDepositInUsd(state, vaultId));
  }
  return total;
};

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

export const selectGovVaultPendingRewardsInToken = (state: BeefyState, vaultId: VaultGov['id']) => {
  const walletBalance = _selectWalletBalance(state);
  return walletBalance?.tokenAmount.byGovVaultId[vaultId]?.rewards || BIG_ZERO;
};

export const selectGovVaultPendingRewardsInUsd = (state: BeefyState, vaultId: VaultGov['id']) => {
  const vault = selectVaultById(state, vaultId);
  const tokenRewards = selectGovVaultPendingRewardsInToken(state, vaultId);
  const tokenPrice = selectTokenPriceByAddress(state, vault.chainId, vault.earnedTokenAddress);
  return tokenRewards.times(tokenPrice);
};

/**
 * Get the token for which the boost balance is expressed in
 * for boosts, balance is the amount of earnedToken of the target vault
 */
export const selectBoostBalanceTokenEntity = (state: BeefyState, boostId: BoostEntity['id']) => {
  const boost = selectBoostById(state, boostId);
  const boostedVault = selectVaultById(state, boost.vaultId);
  return selectTokenByAddress(state, boostedVault.chainId, boostedVault.earnedTokenAddress);
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
  const vault = selectVaultById(state, vaultId);
  return selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
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

export const selectUserLpBreakdownBalance = (
  state: BeefyState,
  vault: VaultEntity,
  breakdown: TokenLpBreakdown
) => {
  const lpTotalSupplyDecimal = new BigNumber(breakdown.totalSupply);
  const userBalanceDecimal = isGovVault(vault)
    ? selectGovVaultUserStakedBalanceInDepositToken(state, vault.id)
    : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);

  const userShareOfPool = lpTotalSupplyDecimal.gt(BIG_ZERO)
    ? userBalanceDecimal.dividedBy(lpTotalSupplyDecimal)
    : BIG_ZERO;
  const oneLpShareOfPool = lpTotalSupplyDecimal.gt(BIG_ZERO)
    ? BIG_ONE.dividedBy(lpTotalSupplyDecimal)
    : BIG_ZERO;

  const assets = breakdown.tokens.map((tokenAddress, i) => {
    const reserves = new BigNumber(breakdown.balances[i]);
    const assetToken = selectTokenByAddress(state, vault.chainId, tokenAddress);
    const valuePerDecimal = selectTokenPriceByAddress(state, vault.chainId, tokenAddress);
    const totalValue = reserves.multipliedBy(valuePerDecimal);

    return {
      ...assetToken,
      totalAmount: reserves,
      userAmount: userShareOfPool.multipliedBy(reserves),
      oneAmount: oneLpShareOfPool.multipliedBy(reserves),
      totalValue,
      userValue: userShareOfPool.multipliedBy(totalValue),
      oneValue: oneLpShareOfPool.multipliedBy(totalValue),
      price: valuePerDecimal,
    };
  });

  return { assets, userShareOfPool, lpTotalSupplyDecimal, userBalanceDecimal, oneLpShareOfPool };
};

export const selectUserExposureByKey = (
  state: BeefyState,
  key: KeysOfType<VaultEntity, string>
) => {
  const userVaults = selectUserDepositedVaultIds(state);
  const valueByKey = userVaults.reduce((totals, vaultId) => {
    const vault = selectVaultById(state, vaultId);
    totals[vault[key]] = (totals[vault[key]] || BIG_ZERO).plus(
      selectUserVaultDepositInUsd(state, vaultId)
    );
    return totals;
  }, {} as Record<string, BigNumber>);

  const userBalance = Object.keys(valueByKey).reduce(
    (cur, tot) => valueByKey[tot].plus(cur),
    BIG_ZERO
  );

  const exposureByKey = Object.keys(valueByKey).map(item => {
    if (key === 'chainId') {
      const chain = selectChainById(state, item);
      return {
        key: item,
        value: valueByKey[item],
        percentage: valueByKey[item].dividedBy(userBalance).toNumber(),
        label: chain.name,
      };
    }
    return {
      key: item,
      value: valueByKey[item],
      percentage: valueByKey[item].dividedBy(userBalance).toNumber(),
    };
  });

  const sortedItems = getTopNArray(exposureByKey, 'percentage');

  return sortedItems;
};

export const selectTokenExposure = (state: BeefyState) => {
  const vaultIds = selectUserDepositedVaultIds(state);
  return vaultIds.reduce((totals, vaultId) => {
    const vault = selectVaultById(state, vaultId);
    if (vault.assetIds.length === 1) {
      totals[vault.assetIds[0]] = {
        value: (totals[vault.assetIds[0]]?.value || BIG_ZERO).plus(
          selectUserVaultDepositInUsd(state, vaultId)
        ),
        assetIds: [vault.assetIds[0]],
        chainId: vault.chainId,
      };
    } else {
      const haveBreakdownData = selectHasBreakdownData(
        state,
        vault.depositTokenAddress,
        vault.chainId
      );
      if (haveBreakdownData) {
        const breakdown = selectLpBreakdownByAddress(
          state,
          vault.chainId,
          vault.depositTokenAddress
        );
        const { assets } = selectUserLpBreakdownBalance(state, vault, breakdown);
        for (const asset of assets) {
          totals[asset.id] = {
            value: (totals[asset.id]?.value || BIG_ZERO).plus(asset.userValue),
            assetIds: [asset.id],
            chainId: vault.chainId,
          };
        }
      } else {
        totals[vault.name] = {
          value: selectUserVaultDepositInUsd(state, vaultId),
          assetIds: vault.assetIds,
          chainId: vault.chainId,
        };
      }
    }

    return totals;
  }, {} as Record<string, { value: BigNumber; assetIds: TokenEntity['id'][]; chainId: ChainEntity['id'] }>);
};

export const selectUserTokenExposure = (state: BeefyState) => {
  const valuesByToken = selectTokenExposure(state);
  const userBalance = Object.keys(valuesByToken).reduce(
    (cur, tot) => valuesByToken[tot].value.plus(cur),
    BIG_ZERO
  );
  const exposureByTokens = Object.keys(valuesByToken).map(token => {
    return {
      key: token,
      value: valuesByToken[token].value,
      percentage: valuesByToken[token].value.dividedBy(userBalance).toNumber(),
      assetIds: valuesByToken[token].assetIds,
      chainId: valuesByToken[token].chainId,
    };
  });
  return getTopNArray(exposureByTokens, 'percentage');
};

export const selectStablecoinsExposure = (state: BeefyState) => {
  const vaultIds = selectUserDepositedVaultIds(state);
  return vaultIds.reduce(
    (totals, vaultId) => {
      const vault = selectVaultById(state, vaultId);
      if (selectIsVaultStable(state, vault.id)) {
        totals['stable'] = (totals['stable'] || BIG_ZERO).plus(
          selectUserVaultDepositInUsd(state, vaultId)
        );
      } else {
        const haveBreakdownData = selectHasBreakdownData(
          state,
          vault.depositTokenAddress,
          vault.chainId
        );
        if (haveBreakdownData) {
          const breakdown = selectLpBreakdownByAddress(
            state,
            vault.chainId,
            vault.depositTokenAddress
          );
          const { assets } = selectUserLpBreakdownBalance(state, vault, breakdown);
          for (const asset of assets) {
            if (selectIsTokenStable(state, asset.chainId, asset.id)) {
              totals['stable'] = (totals['stable'] || BIG_ZERO).plus(asset.userValue);
            } else {
              totals['other'] = (totals['other'] || BIG_ZERO).plus(asset.userValue);
            }
          }
        } else {
          totals['other'] = (totals['other'] || BIG_ZERO).plus(
            selectUserVaultDepositInUsd(state, vaultId)
          );
        }
      }
      return totals;
    },
    { stable: BIG_ZERO, other: BIG_ZERO } as Record<string, BigNumber>
  );
};

export const selectUserStablecoinsExposure = (state: BeefyState) => {
  const stablesExposure = selectStablecoinsExposure(state);
  const userBalance = Object.keys(stablesExposure).reduce(
    (cur, tot) => stablesExposure[tot].plus(cur),
    BIG_ZERO
  );
  const stablecoinsExposure = Object.keys(stablesExposure).map(type => {
    return {
      key: type,
      value: stablesExposure[type],
      percentage: stablesExposure[type].dividedBy(userBalance).toNumber(),
      color: type === 'stable' ? '#3D5CF5' : '#C2D65C',
    };
  });
  return sortBy(stablecoinsExposure, ['key']).reverse();
};

export const selectUserVaultBalances = (state: BeefyState) => {
  const userVaults = selectUserDepositedVaultIds(state);
  const result = userVaults.reduce((totals, vaultId) => {
    const vault = selectVaultById(state, vaultId);
    const chainId = vault.chainId;
    const vaults = totals[chainId]?.vaults || [];
    vaults.push(vault);
    const depositedByChain = (totals[chainId]?.depositedByChain || BIG_ZERO).plus(
      selectUserVaultDepositInUsd(state, vaultId)
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

export const selectVaultsWithBalanceByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  const userVaults = selectUserDepositedVaultIds(state);
  const vaults = {};
  for (const vaultId of userVaults) {
    const vault = selectVaultById(state, vaultId);
    if (vault.chainId === chainId) {
      vaults[vaultId] = selectUserVaultDepositInUsd(state, vaultId);
    }
  }
  return vaults;
};
