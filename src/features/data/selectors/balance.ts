import { mooAmountToOracleAmount } from '../utils/ppfs';
import type { BeefyState } from '../../../redux-types';
import type { BoostEntity } from '../entities/boost';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity, TokenLpBreakdown } from '../entities/token';
import type { VaultEntity, VaultGov } from '../entities/vault';
import { isGovVault, isStandardVault } from '../entities/vault';
import { selectActiveVaultBoostIds, selectAllVaultBoostIds, selectBoostById } from './boosts';
import { createCachedSelector } from 're-reselect';
import {
  selectHasBreakdownDataByTokenAddress,
  selectIsTokenStable,
  selectLpBreakdownByTokenAddress,
  selectTokenByAddress,
  selectTokenPriceByAddress,
  selectTokenPriceByTokenOracleId,
  selectTokensByChainId,
  selectWrappedToNativeSymbolOrTokenSymbol,
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
import type { KeysOfType } from '../utils/types-utils';
import { getTopNArray } from '../utils/array-utils';
import { sortBy } from 'lodash-es';
import { createSelector } from '@reduxjs/toolkit';
import { selectChainById } from './chains';
import { selectVaultPnl } from './analytics';
import type { VaultPnLDataType } from '../../../components/VaultStats/types';

const _selectWalletBalance = (state: BeefyState, walletAddress?: string) => {
  if (walletAddress) {
    return selectWalletBalanceByAddress(state, walletAddress);
  }

  if (selectIsWalletKnown(state)) {
    const userAddress = selectWalletAddress(state);
    if (!userAddress) {
      return null;
    }

    return selectWalletBalanceByAddress(state, userAddress);
  }
};

export const selectWalletBalanceByAddress = createCachedSelector(
  (state: BeefyState, _walletAddress: string) => state.user.balance.byAddress,
  (state: BeefyState, walletAddress: string) => walletAddress.toLocaleLowerCase(),
  (balancesByAddress, walletAddress) => balancesByAddress[walletAddress] || null
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

export const selectUserBalanceOfTokensIncludingBoostsBridged = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  chainId: ChainEntity['id'],
  tokenAddress: TokenEntity['address'],
  walletAddress?: string
) => {
  //first we get mootokens
  const vault = selectVaultById(state, vaultId);
  let mooTokenBalance = selectUserBalanceOfToken(state, chainId, tokenAddress, walletAddress);

  // we also need to account for deposits in boost (even those expired)
  const boostIds = selectAllVaultBoostIds(state, vaultId);
  for (const boostId of boostIds) {
    const boostMooToken = selectBoostUserBalanceInToken(state, boostId, walletAddress);
    mooTokenBalance = mooTokenBalance.plus(boostMooToken);
  }

  // account for bridged mooToken
  if (isStandardVault(vault) && vault.bridged) {
    for (const [chainId, tokenAddress] of Object.entries(vault.bridged)) {
      const bridgedMooToken = selectUserBalanceOfToken(state, chainId, tokenAddress, walletAddress);
      mooTokenBalance = mooTokenBalance.plus(bridgedMooToken);
    }
  }

  return mooTokenBalance;
};

/**
 * "User" balance refers to the balance displayed to the user
 * so we have to do the translation from earnedToken (mooToken) to depositToken
 * that the user deposited
 */
export const selectStandardVaultUserBalanceInDepositTokenExcludingBoostsBridged = (
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
export const selectStandardVaultUserBalanceInDepositTokenIncludingBoostsBridged = (
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

  // account for bridged mooToken
  if (vault.bridged) {
    for (const [chainId, tokenAddress] of Object.entries(vault.bridged)) {
      const bridgedMooToken = selectUserBalanceOfToken(state, chainId, tokenAddress, walletAddress);
      mooTokenBalance = mooTokenBalance.plus(bridgedMooToken);
    }
  }

  return mooAmountToOracleAmount(mooToken, depositToken, ppfs, mooTokenBalance);
};

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
  const mooToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
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
  if (vault.bridged) {
    for (const [chainId, tokenAddress] of Object.entries(vault.bridged)) {
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

/**
 * Includes boosts and bridged tokens
 */
export const selectUserVaultDepositInDepositToken = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  if (isGovVault(vault)) {
    return selectGovVaultUserStakedBalanceInDepositToken(state, vaultId, walletAddress);
  } else {
    return selectStandardVaultUserBalanceInDepositTokenIncludingBoostsBridged(
      state,
      vaultId,
      walletAddress
    );
  }
};

export const selectUserVaultDepositInDepositTokenExcludingBoostsBridged = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  if (isGovVault(vault)) {
    return selectGovVaultUserStakedBalanceInDepositToken(state, vaultId, walletAddress);
  } else {
    return selectStandardVaultUserBalanceInDepositTokenExcludingBoostsBridged(
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

/**
 * Includes boosts and bridged tokens
 */
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

export const selectGovVaultPendingRewardsInToken = (
  state: BeefyState,
  vaultId: VaultGov['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount.byGovVaultId[vaultId]?.rewards || BIG_ZERO;
};

export const selectGovVaultPendingRewardsInUsd = (
  state: BeefyState,
  vaultId: VaultGov['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  const tokenRewards = selectGovVaultPendingRewardsInToken(state, vaultId, walletAddress);
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
) => {
  const lpTotalSupplyDecimal = new BigNumber(breakdown.totalSupply);
  const userBalanceDecimal = isGovVault(vault)
    ? selectGovVaultUserStakedBalanceInDepositToken(state, vault.id, walletAddress)
    : selectStandardVaultUserBalanceInDepositTokenIncludingBoostsBridged(
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
  key: KeysOfType<VaultEntity, string>,
  walletAddress?: string
) => {
  const userVaults = selectUserDepositedVaultIds(state, walletAddress);
  const valueByKey = userVaults.reduce((totals, vaultId) => {
    const vault = selectVaultById(state, vaultId);
    totals[vault[key]] = (totals[vault[key]] || BIG_ZERO).plus(
      selectUserVaultDepositInUsd(state, vaultId, walletAddress)
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

export const selectTokenExposure = (state: BeefyState, walletAddress?: string) => {
  const vaultIds = selectUserDepositedVaultIds(state, walletAddress);
  return vaultIds.reduce((totals, vaultId) => {
    const vault = selectVaultById(state, vaultId);

    if (vault.assetIds.length === 1) {
      const assetId = selectWrappedToNativeSymbolOrTokenSymbol(state, vault.assetIds[0]);
      totals[assetId] = {
        value: (totals[assetId]?.value || BIG_ZERO).plus(
          selectUserVaultDepositInUsd(state, vaultId, walletAddress)
        ),
        assetIds: [assetId],
        chainId: vault.chainId,
      };
    } else {
      const haveBreakdownData = selectHasBreakdownDataByTokenAddress(
        state,
        vault.depositTokenAddress,
        vault.chainId
      );
      if (haveBreakdownData) {
        const breakdown = selectLpBreakdownByTokenAddress(
          state,
          vault.chainId,
          vault.depositTokenAddress
        );
        const { assets } = selectUserLpBreakdownBalance(state, vault, breakdown, walletAddress);
        for (const asset of assets) {
          const assetId = selectWrappedToNativeSymbolOrTokenSymbol(state, asset.symbol);
          totals[assetId] = {
            value: (totals[assetId]?.value || BIG_ZERO).plus(asset.userValue),
            assetIds: [assetId],
            chainId: vault.chainId,
          };
        }
      } else {
        totals[vault.name] = {
          value: selectUserVaultDepositInUsd(state, vaultId, walletAddress),
          assetIds: vault.assetIds,
          chainId: vault.chainId,
        };
      }
    }

    return totals;
  }, {} as Record<string, { value: BigNumber; assetIds: TokenEntity['id'][]; chainId: ChainEntity['id'] }>);
};

export const selectUserTokenExposure = (state: BeefyState, walletAddress?: string) => {
  const valuesByToken = selectTokenExposure(state, walletAddress);
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

export const selectStablecoinsExposure = (state: BeefyState, walletAddress?: string) => {
  const vaultIds = selectUserDepositedVaultIds(state, walletAddress);
  return vaultIds.reduce(
    (totals, vaultId) => {
      const vault = selectVaultById(state, vaultId);
      if (selectIsVaultStable(state, vault.id)) {
        totals['stable'] = (totals['stable'] || BIG_ZERO).plus(
          selectUserVaultDepositInUsd(state, vaultId, walletAddress)
        );
      } else {
        const haveBreakdownData = selectHasBreakdownDataByTokenAddress(
          state,
          vault.depositTokenAddress,
          vault.chainId
        );
        if (haveBreakdownData) {
          const breakdown = selectLpBreakdownByTokenAddress(
            state,
            vault.chainId,
            vault.depositTokenAddress
          );
          const { assets } = selectUserLpBreakdownBalance(state, vault, breakdown, walletAddress);
          for (const asset of assets) {
            if (selectIsTokenStable(state, asset.chainId, asset.id)) {
              totals['stable'] = (totals['stable'] || BIG_ZERO).plus(asset.userValue);
            } else {
              totals['other'] = (totals['other'] || BIG_ZERO).plus(asset.userValue);
            }
          }
        } else {
          totals['other'] = (totals['other'] || BIG_ZERO).plus(
            selectUserVaultDepositInUsd(state, vaultId, walletAddress)
          );
        }
      }
      return totals;
    },
    { stable: BIG_ZERO, other: BIG_ZERO } as Record<string, BigNumber>
  );
};

export const selectUserStablecoinsExposure = (state: BeefyState, walletAddress?: string) => {
  const stablesExposure = selectStablecoinsExposure(state, walletAddress);
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

export const selectUserVaultsPnl = (state: BeefyState, walletAddress?: string) => {
  const userVaults = selectUserDepositedVaultIds(state, walletAddress);
  const vaults: Record<string, VaultPnLDataType> = {};
  for (const vaultId of userVaults) {
    vaults[vaultId] = selectVaultPnl(state, vaultId, walletAddress);
  }
  return vaults;
};

export const selectUserTotalYieldUsd = (state: BeefyState, walletAddress?: string) => {
  const vaultPnls = selectUserVaultsPnl(state, walletAddress);

  let totalYieldUsd = BIG_ZERO;
  for (const vaultPnl of Object.values(vaultPnls)) {
    totalYieldUsd = totalYieldUsd.plus(vaultPnl.totalYieldUsd);
  }

  return totalYieldUsd;
};

export const selectUserRewardsByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const rewards: {
    rewardToken: TokenEntity['oracleId'];
    rewards: BigNumber;
    rewardsUsd: BigNumber;
  }[] = [];
  const rewardsTokens = [];
  let totalRewardsUsd = BIG_ZERO;

  const vault = selectVaultById(state, vaultId);

  if (isGovVault(vault)) {
    const earnedToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
    const rewardsEarnedToken = selectGovVaultPendingRewardsInToken(state, vault.id, walletAddress);
    const rewardsEarnedUsd = selectGovVaultPendingRewardsInUsd(state, vault.id, walletAddress);

    totalRewardsUsd = rewardsEarnedUsd;
    rewardsTokens.push(earnedToken.oracleId);

    rewards.push({
      rewardToken: earnedToken.oracleId,
      rewards: rewardsEarnedToken,
      rewardsUsd: rewardsEarnedUsd,
    });
  } else {
    const boosts = selectAllVaultBoostIds(state, vaultId);
    for (const boostId of boosts) {
      const rewardToken = selectBoostRewardsTokenEntity(state, boostId);
      const boostPendingRewards = selectBoostUserRewardsInToken(state, boostId, walletAddress);
      const oraclePrice = selectTokenPriceByTokenOracleId(state, rewardToken.oracleId);
      if (boostPendingRewards.isGreaterThan(BIG_ZERO)) {
        const tokenOracleId = rewardToken.oracleId;
        const tokenRewardsUsd = boostPendingRewards.times(oraclePrice);

        rewardsTokens.push(tokenOracleId);
        totalRewardsUsd = totalRewardsUsd.plus(tokenRewardsUsd);

        rewards.push({
          rewardToken: tokenOracleId,
          rewards: boostPendingRewards,
          rewardsUsd: tokenRewardsUsd,
        });
      }
    }
  }

  return { rewards, rewardsTokens, totalRewardsUsd };
};
