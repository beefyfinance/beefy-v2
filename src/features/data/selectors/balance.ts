import { createSelector } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../helpers/format';
import { BeefyState } from '../../../redux-types';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { isGovVault, VaultEntity, VaultGov } from '../entities/vault';
import { selectBoostById } from './boosts';
import { selectTokenById, selectTokenPriceByTokenId } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';
import { selectIsWalletConnected, selectWalletAddress } from './wallet';

const _selectWalletBalance = (state: BeefyState, walletAddress?: string) => {
  if (selectIsWalletConnected(state)) {
    const userAddress = walletAddress || selectWalletAddress(state);
    const walletBalance = state.user.balance.byAddress[userAddress.toLocaleLowerCase()];
    return walletBalance || null;
  } else {
    return null;
  }
};

export const selectHasWalletBalanceBeenFetched = (state: BeefyState, walletAddress: string) => {
  return state.user.balance.byAddress[walletAddress.toLocaleLowerCase()] !== undefined;
};

export const selectUserDepositedVaults = (state: BeefyState) => {
  const walletBalance = _selectWalletBalance(state);
  return walletBalance ? walletBalance.depositedVaultIds : [];
};

export const selectHasUserDepositInVault = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const walletBalance = _selectWalletBalance(state);
  return walletBalance ? walletBalance.depositedVaultIds.indexOf(vaultId) !== -1 : false;
};

export const selectIsUserEligibleForVault = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const walletBalance = _selectWalletBalance(state);
  return walletBalance ? walletBalance.eligibleVaultIds.indexOf(vaultId) !== -1 : false;
};

export const selectWalletBalanceOfToken = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount.byChainId[chainId]?.byTokenId[tokenId]?.balance || BIG_ZERO;
};

export const selectHasWalletBalanceOfToken = createSelector(
  selectWalletBalanceOfToken,
  tokenBalance => tokenBalance.gt(0)
);

/**
 * "User" balance refers to the balance displayed to the user
 * so we have to do the translation from earnedToken (mooToken) to oracleToken
 * that the user deposited
 */
export const selectStandardVaultUserBalanceInToken = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  if (isGovVault(vault)) {
    throw new Error(`Trying to get standard vault balance but vault ${vault.id} is a gov vault`);
  }
  const earnedTokenBalance = selectWalletBalanceOfToken(
    state,
    vault.chainId,
    vault.earnedTokenId,
    walletAddress
  );
  const ppfs = selectVaultPricePerFullShare(state, vault.id);
  return earnedTokenBalance.multipliedBy(ppfs);
};

export const selectGovVaultUserBalanceInToken = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  const vault = selectVaultById(state, vaultId);
  if (!isGovVault(vault)) {
    throw new Error(`Trying to get gov vault balance but vault ${vault.id} is a not a gov vault`);
  }
  return walletBalance?.tokenAmount.byGovVaultId[vaultId]?.balance || BIG_ZERO;
};

export const selectUserVaultDepositInToken = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  if (isGovVault(vault)) {
    return selectGovVaultUserBalanceInToken(state, vaultId, walletAddress);
  } else {
    return selectStandardVaultUserBalanceInToken(state, vaultId, walletAddress);
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

export const selectUserVaultDepositInUsd = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  // TODO: do this in the state?
  const vault = selectVaultById(state, vaultId);
  const oraclePrice = selectTokenPriceByTokenId(state, vault.oracleId);
  const vaultTokenDeposit = selectUserVaultDepositInToken(state, vaultId, walletAddress);

  return vaultTokenDeposit.multipliedBy(oraclePrice);
};

export const selectGovVaultPendingRewardsInToken = (state: BeefyState, vaultId: VaultGov['id']) => {
  const walletBalance = _selectWalletBalance(state);
  return walletBalance?.tokenAmount.byGovVaultId[vaultId]?.rewards[vaultId] || BIG_ZERO;
};

export const selectHasGovVaultPendingRewards = (state: BeefyState, vaultId: VaultGov['id']) => {
  return !selectGovVaultPendingRewardsInToken(state, vaultId).isZero();
};

// TODO implement this
export const selectGovVaultPendingRewardsInUsd = (state: BeefyState, vaultId: VaultGov['id']) => {
  return selectGovVaultPendingRewardsInToken(state, vaultId);
};

/**
 * Get the token for which the boost balance is expressed in
 * for boosts, balance is the amount of earnedToken of the target vault
 */
export const selectBoostBalanceTokenEntity = (state: BeefyState, boostId: BoostEntity['id']) => {
  const boost = selectBoostById(state, boostId);
  const boostedVault = selectVaultById(state, boost.vaultId);
  return selectTokenById(state, boostedVault.chainId, boostedVault.earnedTokenId);
};

/**
 * Get the token for which the boost rewards are expressed in
 * for boosts, rewards is the amount of earnedToken of the boost
 */
export const selectBoostRewardsTokenEntity = (state: BeefyState, boostId: BoostEntity['id']) => {
  const boost = selectBoostById(state, boostId);
  return selectTokenById(state, boost.chainId, boost.earnedTokenId);
};

/**
 * Get the token for which the gov vault balance is expressed in
 * for gov vault, balance is the amount of oracleId token
 */
export const selectGovVaultBalanceTokenEntity = (state: BeefyState, vaultId: VaultGov['id']) => {
  const vault = selectVaultById(state, vaultId);
  return selectTokenById(state, vault.chainId, vault.oracleId);
};

/**
 * Get the token for which the gov vault rewards are expressed in
 * for gov vault, rewards is an amount in earnedTokenId
 */
export const selectGovVaultRewardsTokenEntity = (state: BeefyState, vaultId: VaultGov['id']) => {
  const vault = selectVaultById(state, vaultId);
  return selectTokenById(state, vault.chainId, vault.earnedTokenId);
};
