import { createSelector } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../helpers/format';
import { BeefyState } from '../../../redux-types';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { isGovVault, VaultEntity, VaultGov } from '../entities/vault';
import { selectTokenPriceByTokenId } from './tokens';
import { selectVaultById } from './vaults';
import { selectIsWalletConnected, selectWalletAddress } from './wallet';

const _selectWalletBalance = (state: BeefyState) => {
  if (selectIsWalletConnected(state)) {
    const walletAddress = selectWalletAddress(state);
    const walletBalance = state.user.balance.byAddress[walletAddress.toLocaleLowerCase()];
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
  if (walletBalance !== null) {
    return walletBalance.depositedVaultIds.govVaults
      .concat(walletBalance.depositedVaultIds.standardVaults)
      .map(v => v.vaultId);
  } else {
    return [];
  }
};

export const selectStandardVaultUserBalanceInToken = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  vaultId: VaultEntity['id']
) => {
  const vault = selectVaultById(state, vaultId);
  if (isGovVault(vault)) {
    throw new Error(`Trying to get standard vault balance but vault ${vault.id} is a gov vault`);
  }
  const walletBalance = _selectWalletBalance(state);
  const tokenBalance = walletBalance?.byChainId[chainId]?.byTokenId[vault.earnedTokenId];
  if (!tokenBalance) {
    return BIG_ZERO;
  }
  return tokenBalance.balance;
};

export const selectWalletBalanceOfToken = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const walletBalance = _selectWalletBalance(state);
  if (walletBalance === null) {
    return BIG_ZERO;
  }
  const tokenBalance = walletBalance.byChainId[chainId]?.byTokenId[tokenId];
  return tokenBalance === undefined ? BIG_ZERO : tokenBalance.balance;
};

export const selectHasWalletBalanceOfToken = createSelector(
  selectWalletBalanceOfToken,
  tokenBalance => tokenBalance.gt(0)
);

export const selectGovVaultUserBalance = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  vaultId: VaultEntity['id']
) => {
  const walletBalance = _selectWalletBalance(state);
  const vaultBalance = walletBalance?.byChainId[chainId]?.byGovVaultId[vaultId];

  if (!vaultBalance) {
    return BIG_ZERO;
  }
  return vaultBalance.balance;
};

export const selectTokenUserBalance = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  vaultId: VaultEntity['id']
) => {
  const walletBalance = _selectWalletBalance(state);
  const tokenBalance = walletBalance?.byChainId[chainId]?.byTokenId[vaultId];
  if (!tokenBalance) {
    return BIG_ZERO;
  }
  return tokenBalance.balance;
};

export const selectUserVaultDepositInToken = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const walletBalance = _selectWalletBalance(state);
  const vaultBalance = walletBalance?.deposited[vaultId]?.balance;
  if (!vaultBalance) {
    return BIG_ZERO;
  }
  return vaultBalance;
};

export const selectHasUserDepositInVault = createSelector(
  selectUserVaultDepositInToken,
  vaultDeposit => vaultDeposit.gt(0)
);

export const selectUserVaultDepositInUsd = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    // TODO: do this in the state
    const vault = selectVaultById(state, vaultId);
    const oraclePrice = selectTokenPriceByTokenId(state, vault.oracleId);
    const vaultTokenDeposit = selectUserVaultDepositInToken(state, vaultId);

    return vaultTokenDeposit.multipliedBy(oraclePrice);
  },
  res => res
);

export const selectBoostUserBalanceInToken = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  boostId: BoostEntity['id']
) => {
  const walletBalance = _selectWalletBalance(state);
  const boostBalance = walletBalance?.byChainId[chainId]?.byBoostId[boostId];
  if (!boostBalance) {
    return BIG_ZERO;
  }
  return boostBalance.balance;
};

export const selectHasGovVaultPendingRewards = (state: BeefyState, vaultId: VaultGov['id']) => {
  const walletBalance = _selectWalletBalance(state);
  const rewards = walletBalance?.rewards[vaultId];
  return rewards ? rewards.balance.gt(0) : false;
};

export const selectGovVaultPendingRewardsInToken = (state: BeefyState, vaultId: VaultGov['id']) => {
  const walletBalance = _selectWalletBalance(state);
  const rewards = walletBalance?.rewards[vaultId];
  return rewards ? rewards.shares : BIG_ZERO;
};

// TODO implement this
export const selectGovVaultPendingRewardsInUsd = (state: BeefyState, vaultId: VaultGov['id']) => {
  const walletBalance = _selectWalletBalance(state);
  const rewards = walletBalance?.rewards[vaultId];
  return rewards ? rewards.shares : BIG_ZERO;
};
