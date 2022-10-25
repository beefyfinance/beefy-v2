import { mooAmountToOracleAmount } from '../utils/ppfs';
import { BeefyState } from '../../../redux-types';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { TokenEntity, TokenLpBreakdown } from '../entities/token';
import { isGovVault, VaultEntity, VaultGov } from '../entities/vault';
import { selectActiveVaultBoostIds, selectAllVaultBoostIds, selectBoostById } from './boosts';
import {
  selectHaveBreakdownData,
  selectIsTokenStable,
  selectLpBreakdownByAddress,
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from './tokens';
import {
  selectIsVaultStable,
  selectStandardVaultById,
  selectVaultById,
  selectVaultPricePerFullShare,
} from './vaults';
import { selectIsWalletKnown, selectWalletAddress } from './wallet';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number';
import BigNumber from 'bignumber.js';
import { selectUserGlobalStats } from './apy';
import { KeysOfType } from '../utils/types-utils';
import { getTop6Array } from '../utils/array-utils';
import { sortBy } from 'lodash';
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

export const selectAllTokenWhereUserCouldHaveBalance = (
  state: BeefyState,
  chainId: ChainEntity['id']
) => {
  const byChainId = state.entities.tokens.byChainId;
  if (byChainId[chainId] === undefined) {
    throw new Error(`selectTokenByAddress: Unknown chain id ${chainId}`);
  }
  return byChainId[chainId].interestingBalanceTokenAddresses;
};

export const selectHasWalletBalanceBeenFetched = (state: BeefyState, walletAddress: string) => {
  return state.user.balance.byAddress[walletAddress.toLowerCase()] !== undefined;
};

export const selectUserDepositedVaults = (state: BeefyState) => {
  const walletBalance = _selectWalletBalance(state);
  return walletBalance ? walletBalance.depositedVaultIds : [];
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
  const vaultOracleBalance = selectStandardVaultUserBalanceInDepositTokenExcludingBoosts(
    state,
    vaultId,
    walletAddress
  );
  // we also need to account for deposits in boost (even those expired)
  let mooTokenBalance = BIG_ZERO;
  const boostIds = selectAllVaultBoostIds(state, vaultId);
  for (const boostId of boostIds) {
    const boostMooToken = selectBoostUserBalanceInToken(state, boostId, walletAddress);
    mooTokenBalance = mooTokenBalance.plus(boostMooToken);
  }
  const boostOracleBalance = mooAmountToOracleAmount(mooToken, depositToken, ppfs, mooTokenBalance);
  return vaultOracleBalance.plus(boostOracleBalance);
};

export const selectGovVaultUserStackedBalanceInDepositToken = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount.byGovVaultId[vaultId]?.balance || BIG_ZERO;
};

const selectUserVaultDepositInDepositToken = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  if (isGovVault(vault)) {
    return selectGovVaultUserStackedBalanceInDepositToken(state, vaultId, walletAddress);
  } else {
    return selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(
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
  vault: VaultEntity,
  breakdown: TokenLpBreakdown
) => {
  const lpTotalSupplyDecimal = new BigNumber(breakdown.totalSupply);
  const userBalanceDecimal = isGovVault(vault)
    ? selectGovVaultUserStackedBalanceInDepositToken(state, vault.id)
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
  const userVaults = selectUserDepositedVaults(state).map(vaultId =>
    selectVaultById(state, vaultId)
  );

  const valueByKey = userVaults.reduce((totals, vault) => {
    totals[vault[key]] = (totals[vault[key]] || BIG_ZERO).plus(
      selectUserVaultDepositInUsd(state, vault.id)
    );
    return totals;
  }, {} as Record<string, BigNumber>);

  const userBalance = selectUserGlobalStats(state).deposited;

  const exposureByKey = Object.keys(valueByKey).map((token, i) => {
    return {
      key: token,
      value: valueByKey[token],
      percentage: valueByKey[token].dividedBy(userBalance).toNumber(),
    };
  });

  const sortedItems = getTop6Array(exposureByKey);

  return sortedItems;
};

export const selectUserTokenExposure = (state: BeefyState) => {
  const userVaults = selectUserDepositedVaults(state).map(vaultId =>
    selectVaultById(state, vaultId)
  );

  const valuesByToken = userVaults.reduce((totals, vault) => {
    if (vault.assetIds.length === 1) {
      totals[vault.assetIds[0]] = (totals[vault.assetIds[0]] || BIG_ZERO).plus(
        selectUserVaultDepositInUsd(state, vault.id)
      );
    } else {
      const haveBreakdownData = selectHaveBreakdownData(state, vault);
      if (haveBreakdownData) {
        const breakdown = selectLpBreakdownByAddress(
          state,
          vault.chainId,
          vault.depositTokenAddress
        );
        const { assets } = selectLpBreakdownBalance(state, vault, breakdown);
        for (const asset of assets) {
          totals[asset.id] = (totals[asset.id] || BIG_ZERO).plus(asset.userValue);
        }
      } else {
        totals[vault.name] = selectUserVaultDepositInUsd(state, vault.id);
      }
    }

    return totals;
  }, {} as Record<string, BigNumber>);

  const userBalance = Object.keys(valuesByToken).reduce(
    (cur, tot) => valuesByToken[tot].plus(cur),
    BIG_ZERO
  );

  const exposureByTokens = Object.keys(valuesByToken).map((token, i) => {
    return {
      key: token,
      value: valuesByToken[token],
      percentage: valuesByToken[token].dividedBy(userBalance).toNumber(),
    };
  });

  const sortedItems = getTop6Array(exposureByTokens);

  return sortedItems;
};

export const selectUserStablecoinsExposure = (state: BeefyState) => {
  const userVaults = selectUserDepositedVaults(state).map(vaultId =>
    selectVaultById(state, vaultId)
  );

  const exposure = userVaults.reduce((totals, vault) => {
    if (selectIsVaultStable(state, vault.id)) {
      totals['stable'] = (totals['stable'] || BIG_ZERO).plus(
        selectUserVaultDepositInUsd(state, vault.id)
      );
    } else {
      const haveBreakdownData = selectHaveBreakdownData(state, vault);
      if (haveBreakdownData) {
        const breakdown = selectLpBreakdownByAddress(
          state,
          vault.chainId,
          vault.depositTokenAddress
        );
        const { assets } = selectLpBreakdownBalance(state, vault, breakdown);
        for (const asset of assets) {
          if (selectIsTokenStable(state, asset.chainId, asset.id)) {
            totals['stable'] = (totals['stable'] || BIG_ZERO).plus(asset.userValue);
          } else {
            totals['other'] = (totals['other'] || BIG_ZERO).plus(asset.userValue);
          }
        }
      } else {
        totals['other'] = (totals['other'] || BIG_ZERO).plus(
          selectUserVaultDepositInUsd(state, vault.id)
        );
      }
    }
    return totals;
  }, {} as Record<string, BigNumber>);

  const userBalance = Object.keys(exposure).reduce((cur, tot) => exposure[tot].plus(cur), BIG_ZERO);

  const stablecoinsExposure = Object.keys(exposure).map(type => {
    return {
      key: type,
      value: exposure[type],
      percentage: exposure[type].dividedBy(userBalance).toNumber(),
      color: type === 'stable' ? '#3D5CF5' : '#C2D65C',
    };
  });

  return sortBy(stablecoinsExposure, ['key']).reverse();
};

export const selectUserVaultBalance = (state: BeefyState) => {
  const userVaults = selectUserDepositedVaults(state).map(vaultId =>
    selectVaultById(state, vaultId)
  );

  return userVaults.reduce((totals, vault) => {
    const chainId = vault.chainId;
    const vaultsTemp = totals[chainId]?.vaults ?? [];
    const vaults = [...vaultsTemp, vault];
    const depositedByChain = (totals[chainId]?.depositedByChain || BIG_ZERO).plus(
      selectUserVaultDepositInUsd(state, vault.id)
    );

    totals[chainId] = {
      vaults,
      depositedByChain,
    };

    return totals;
  }, {} as Record<string, { vaults: VaultEntity[]; depositedByChain: BigNumber }>);
};
