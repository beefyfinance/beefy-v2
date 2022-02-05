import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { byDecimals } from '../../../helpers/format';
import { BeefyState } from '../../../redux-types';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { isGovVault, VaultEntity, VaultGov } from '../entities/vault';
import { selectTokenById, selectTokenPriceByTokenId } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';

export const selectUserDepositedVaults = createSelector(
  (state: BeefyState) => state.user.balance.depositedVaultIds,
  depositedVaultIds =>
    depositedVaultIds.govVaults.concat(depositedVaultIds.standardVaults).map(v => v.vaultId)
);

export const selectStandardVaultUserBalanceInToken = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => state.user.balance.byChainId[chainId],
  (state: BeefyState, chainId: ChainEntity['id'], vaultId: VaultEntity['id']) =>
    selectVaultById(state, vaultId),
  (chainBalance, vault) => {
    if (isGovVault(vault)) {
      throw new Error(`Trying to get standard vault balance but vault ${vault.id} is a gov vault`);
    }
    const tokenBalance = chainBalance.byTokenId[vault.earnedTokenId];
    if (!tokenBalance) {
      return new BigNumber(0);
    }
    return tokenBalance.balance;
  }
);

export const selectWalletBalanceOfToken = createSelector(
  (state: BeefyState, chainId: ChainEntity['id'], tokenId: TokenEntity['id']) =>
    state.user.balance.byChainId[chainId]?.byTokenId[tokenId],
  tokenBalance => (tokenBalance === undefined ? new BigNumber(0) : tokenBalance.balance)
);

export const selectHasWalletBalanceOfToken = createSelector(
  selectWalletBalanceOfToken,
  tokenBalance => tokenBalance.gt(0)
);

export const selectGovVaultUserBalance = createSelector(
  (state: BeefyState, chainId: ChainEntity['id'], vaultId: VaultEntity['id']) =>
    state.user.balance.byChainId[chainId]?.byGovVaultId[vaultId],
  govVaultBalance => {
    if (!govVaultBalance) {
      return new BigNumber(0);
    }
    return govVaultBalance.balance;
  }
);

export const selectUserVaultDepositInToken = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.user.balance.deposited[vaultId]?.balance,
  vaultBalance => {
    if (!vaultBalance) {
      return new BigNumber(0);
    }
    return vaultBalance;
  }
);

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

export const selectBoostUserBalanceInToken = createSelector(
  (state: BeefyState, chainId: ChainEntity['id'], boostId: BoostEntity['id']) =>
    state.user.balance.byChainId[chainId]?.byBoostId[boostId],
  boostBalance => {
    if (!boostBalance) {
      return new BigNumber(0);
    }
    return boostBalance.balance;
  }
);

export const selectHasGovVaultPendingRewards = createSelector(
  (state: BeefyState, vaultId: VaultGov['id']) => state.user.balance.rewards[vaultId],
  rewards => (rewards ? rewards.balance.gt(0) : false)
);

export const selectGovVaultPendingRewardsInToken = createSelector(
  (state: BeefyState, vaultId: VaultGov['id']) => state.user.balance.rewards[vaultId],
  rewards => (rewards ? rewards.shares : new BigNumber(0))
);
export const selectGovVaultPendingRewardsInUsd = createSelector(
  (state: BeefyState, vaultId: VaultGov['id']) => state.user.balance.rewards[vaultId],
  rewards => (rewards ? rewards.shares : new BigNumber(0))
);
