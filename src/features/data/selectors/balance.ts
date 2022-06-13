import { mooAmountToOracleAmount } from '../utils/ppfs';
import { BeefyState } from '../../../redux-types';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { isGovVault, VaultEntity, VaultGov } from '../entities/vault';
import { selectActiveVaultBoostIds, selectAllVaultBoostIds, selectBoostById } from './boosts';
import { selectTokenByAddress, selectTokenPriceByAddress } from './tokens';
import { selectStandardVaultById, selectVaultById, selectVaultPricePerFullShare } from './vaults';
import { selectIsWalletKnown, selectWalletAddress } from './wallet';
import { BIG_ZERO } from '../../../helpers/big-number';

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
