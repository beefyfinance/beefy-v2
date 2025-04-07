import { mooAmountToOracleAmount } from '../utils/ppfs.ts';
import type { BeefyState } from '../../../redux-types.ts';
import type { BoostPromoEntity } from '../entities/promo.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity, TokenLpBreakdown } from '../entities/token.ts';
import {
  isCowcentratedLikeVault,
  isErc4626Vault,
  isGovVault,
  isSingleGovVault,
  isStandardVault,
  type VaultEntity,
  type VaultGov,
} from '../entities/vault.ts';
import {
  selectAllVaultBoostIds,
  selectBoostById,
  selectIsVaultPreStakedOrBoosted,
  selectVaultCurrentBoostId,
} from './boosts.ts';
import { createCachedSelector } from 're-reselect';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
  selectTokensByChainId,
} from './tokens.ts';
import { selectAllCowcentratedVaults, selectGovVaultById, selectVaultById } from './vaults.ts';
import { selectWalletAddress } from './wallet.ts';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number.ts';
import BigNumber from 'bignumber.js';
import { createSelector } from '@reduxjs/toolkit';
import { entries } from '../../../helpers/object.ts';
import type { UserLpBreakdownBalance } from './balance-types.ts';
import { getCowcentratedAddressFromCowcentratedLikeVault } from '../utils/vault-utils.ts';
import type { BoostReward } from '../apis/balance/balance-types.ts';
import {
  arrayOrStaticEmpty,
  bigNumberOrStaticZero,
  valueOrThrow,
} from '../utils/selector-utils.ts';
import { getUnixNow } from '../../../helpers/date.ts';

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
  (_state: BeefyState, walletAddress: string) => walletAddress.toLocaleLowerCase(),
  (balancesByAddress, walletAddress) => balancesByAddress[walletAddress] || undefined
)((_state: BeefyState, walletAddress: string) => walletAddress);

export const selectAllTokenWhereUserCouldHaveBalance = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => selectTokensByChainId(state, chainId),
  tokens => tokens.interestingBalanceTokenAddresses
);

export const selectHasWalletBalanceBeenFetched = (state: BeefyState, walletAddress: string) => {
  return state.user.balance.byAddress[walletAddress.toLowerCase()] !== undefined;
};

export const selectUserDepositedVaultIds = (state: BeefyState, walletAddress?: string) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return arrayOrStaticEmpty(walletBalance?.depositedVaultIds);
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

  // Vaults without a receipt token (/non ERC-20 vaults)
  if (isSingleGovVault(vault)) {
    // Gov vaults have no shares, only deposit tokens
    return selectGovVaultUserStakedBalanceInDepositToken(state, vaultId, walletAddress);
  }

  return selectUserBalanceOfToken(state, vault.chainId, vault.receiptTokenAddress, walletAddress);
};

/**
 * Only includes shares deposited in boosts
 */
export const selectUserVaultBalanceInShareTokenInBoosts = createSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    _selectWalletBalance(state, maybeWalletAddress)?.tokenAmount.byBoostId,
  (state: BeefyState, vaultId: VaultEntity['id']) => selectAllVaultBoostIds(state, vaultId),
  (byBoostId, boostIds) => {
    if (!byBoostId) {
      return BIG_ZERO;
    }

    return bigNumberOrStaticZero(
      boostIds.reduce((acc, boostId) => {
        return acc.plus(byBoostId[boostId]?.balance || BIG_ZERO);
      }, BIG_ZERO)
    );
  }
);

/**
 * Only includes shares deposited in current boost
 */
export const selectUserVaultBalanceInShareTokenInCurrentBoost = createSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    _selectWalletBalance(state, maybeWalletAddress)?.tokenAmount.byBoostId,
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultCurrentBoostId(state, vaultId),
  (byBoostId, boostId) => {
    if (!byBoostId || !boostId) {
      return BIG_ZERO;
    }

    return bigNumberOrStaticZero(byBoostId[boostId]?.balance);
  }
);

/**
 * Only includes shares bridged to another chain
 */
export const selectUserVaultBalanceInShareTokenInBridged = createSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    _selectWalletBalance(state, maybeWalletAddress)?.tokenAmount.byChainId,
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (byChainId, vault) => {
    if (!byChainId || !isStandardVault(vault) || !vault.bridged) {
      return BIG_ZERO;
    }

    return bigNumberOrStaticZero(
      entries(vault.bridged).reduce((acc, [chainId, tokenAddress]) => {
        return acc.plus(
          byChainId[chainId]?.byTokenAddress[tokenAddress.toLowerCase()]?.balance || BIG_ZERO
        );
      }, BIG_ZERO)
    );
  }
);

export const selectUserVaultPendingWithdrawalOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  maybeWalletAddress?: string
) => {
  return (
    _selectWalletBalance(state, maybeWalletAddress)?.tokenAmount.byVaultId[vaultId]
      ?.pendingWithdrawals || undefined
  );
};

export const selectUserVaultPendingWithdrawal = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  maybeWalletAddress?: string
) => {
  return valueOrThrow(
    selectUserVaultPendingWithdrawalOrUndefined(state, vaultId, maybeWalletAddress)
  );
};

export const selectAddressHasVaultPendingWithdrawal = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string) =>
    selectUserVaultPendingWithdrawalOrUndefined(state, vaultId, walletAddress),
  // only recalculate after 30s if requests state hasn't changed
  (_state: BeefyState) => Math.trunc(Date.now() / 30_000) * 30,
  (pending, _roundedTimestamp): 'claimable' | 'pending' | false => {
    if (!pending || !pending.requests.length) {
      return false;
    }
    const now = getUnixNow();
    return pending.requests.some(request => request.claimableTimestamp >= now) ?
        'claimable'
      : 'pending';
  }
);

/**
 * Only includes shares pending withdrawal
 */
export const selectUserVaultBalanceInShareTokenPendingWithdrawal = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultPendingWithdrawalOrUndefined(state, vaultId, maybeWalletAddress)?.shares,
  shares => bigNumberOrStaticZero(shares)
);

export const selectVaultSharesToDepositTokenData = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.vaults.contractData.byVaultId[vaultId]?.pricePerFullShare,
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    return state.entities.tokens.byChainId[vault.chainId]?.byAddress[
      vault.depositTokenAddress.toLowerCase()
    ];
  },
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    return !isSingleGovVault(vault) ?
        state.entities.tokens.byChainId[vault.chainId]?.byAddress[
          vault.receiptTokenAddress.toLowerCase()
        ]
      : undefined;
  },
  (vault, ppfs, depositToken, shareToken) => {
    if (!depositToken) {
      throw new Error(`Deposit token not found for ${vault.id}`);
    }

    // only standard vaults have ppfs
    if (isStandardVault(vault) || isErc4626Vault(vault)) {
      if (!ppfs) {
        // TODO find what is asking for balances before ppfs loaded
        console.debug(`Price per full share not found for ${vault.id}`);
      }
      if (!shareToken) {
        throw new Error(`Share token not found for ${vault.id}`);
      }

      return {
        ppfs: ppfs || BIG_ONE,
        shareToken,
        depositToken,
      };
    }

    return {
      depositToken,
    };
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

/**
 * Total shares including boosts, bridged and pending withdrawal
 * (For gov vaults this will be in deposit token since there are no shares)
 */
export const selectUserVaultBalanceInShareTokenIncludingDisplaced = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareToken(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenInBoosts(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenInBridged(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenPendingWithdrawal(state, vaultId, maybeWalletAddress),
  (...balances) => {
    return bigNumberOrStaticZero(balances.reduce((acc, balance) => acc.plus(balance), BIG_ZERO));
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Total not in active boost
 */
export const selectUserVaultBalanceNotInActiveBoostInShareToken = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareToken(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenInBoosts(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenInBridged(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenPendingWithdrawal(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenInCurrentBoost(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectIsVaultPreStakedOrBoosted(state, vaultId),
  (inVault, inBoosts, inBridge, pendingWithdrawal, inCurrentBoost, isBoosted) => {
    if (isBoosted) {
      return bigNumberOrStaticZero(
        inVault.plus(inBoosts).plus(pendingWithdrawal).plus(inBridge).minus(inCurrentBoost)
      );
    }

    return BIG_ZERO;
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Balance converted to deposit token, excluding in boosts and bridged tokens
 */
export const selectUserVaultBalanceInDepositToken = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareToken(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectVaultSharesToDepositTokenData(state, vaultId),
  (shares, shareData) =>
    bigNumberOrStaticZero(
      shareData.shareToken ?
        mooAmountToOracleAmount(
          shareData.shareToken,
          shareData.depositToken,
          shareData.ppfs,
          shares
        )
      : shares
    )
)((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Total not in active boost, converted to deposit token
 */
export const selectUserVaultBalanceNotInActiveBoostInDepositToken = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceNotInActiveBoostInShareToken(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectVaultSharesToDepositTokenData(state, vaultId),
  (shares, shareData) =>
    shareData.shareToken ?
      mooAmountToOracleAmount(shareData.shareToken, shareData.depositToken, shareData.ppfs, shares)
    : shares
)((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Balance converted to deposit token, including in boosts, bridged and pending withdrawal
 */
export const selectUserVaultBalanceInDepositTokenIncludingDisplaced = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenIncludingDisplaced(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectVaultSharesToDepositTokenData(state, vaultId),
  (shares, shareData) =>
    bigNumberOrStaticZero(
      shareData.shareToken ?
        mooAmountToOracleAmount(
          shareData.shareToken,
          shareData.depositToken,
          shareData.ppfs,
          shares
        )
      : shares
    )
)((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Balance converted to deposit token, excluding in boosts and bridged tokens
 * @returns {TokenAmount} token: deposit token, amount: balance in deposit token
 */
export const selectUserVaultBalanceInDepositTokenWithToken = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareToken(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectVaultSharesToDepositTokenData(state, vaultId),
  (shares, shareData) => ({
    token: shareData.depositToken,
    amount: bigNumberOrStaticZero(
      shareData.shareToken ?
        mooAmountToOracleAmount(
          shareData.shareToken,
          shareData.depositToken,
          shareData.ppfs,
          shares
        )
      : shares
    ),
  })
)((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

/**
 * Balance converted to deposit token, including in boosts, bridged and pending withdrawal
 * @returns {TokenAmount} token: deposit token, amount: balance in deposit token
 */
export const selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenIncludingDisplaced(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectVaultSharesToDepositTokenData(state, vaultId),
  (shares, shareData) => ({
    token: shareData.depositToken,
    amount: bigNumberOrStaticZero(
      shareData.shareToken ?
        mooAmountToOracleAmount(
          shareData.shareToken,
          shareData.depositToken,
          shareData.ppfs,
          shares
        )
      : shares
    ),
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
  boostId: BoostPromoEntity['id'];
};
export type UserVaultBalanceBreakdownBridged = {
  type: 'bridged';
  id: string;
  amount: BigNumber;
  chainId: ChainEntity['id'];
};
export type UserVaultBalanceBreakdownPendingWithdrawal = {
  type: 'pending-withdrawal';
  id: string;
  amount: BigNumber;
  vaultId: VaultEntity['id'];
};

export type UserVaultBalanceBreakdownEntry =
  | UserVaultBalanceBreakdownVault
  | UserVaultBalanceBreakdownBoost
  | UserVaultBalanceBreakdownBridged
  | UserVaultBalanceBreakdownPendingWithdrawal;

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

  // gov vaults do not have balances elsewhere
  if (isGovVault(vault) || !shareData.shareToken) {
    return balances;
  }

  // only erc4626 vaults may have pending withdrawals
  if (isErc4626Vault(vault)) {
    const pendingWithdrawal = selectUserVaultBalanceInShareTokenPendingWithdrawal(
      state,
      vaultId,
      walletAddress
    );
    if (pendingWithdrawal.gt(BIG_ZERO)) {
      balances.entries.push({
        type: 'pending-withdrawal',
        id: `pending-withdrawal-${vaultId}`,
        vaultId,
        amount: mooAmountToOracleAmount(
          shareData.shareToken,
          shareData.depositToken,
          shareData.ppfs,
          pendingWithdrawal
        ),
      });
    }
  }

  // only standard vaults have boosts or bridged balances
  if (!isStandardVault(vault)) {
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
  boostId: BoostPromoEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount?.byBoostId[boostId]?.balance || BIG_ZERO;
};

const NO_REWARDS: BoostReward[] = [];
export const selectBoostUserRewardsInToken = (
  state: BeefyState,
  boostId: BoostPromoEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount?.byBoostId[boostId]?.rewards || NO_REWARDS;
};

/**
 * Vault balance converted to USD, including in boosts and bridged tokens
 */
export const selectUserVaultBalanceInUsdIncludingDisplaced = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  const vaultTokenDeposit = selectUserVaultBalanceInDepositTokenIncludingDisplaced(
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

/** @dev will NOT default to connected wallet address */
export const selectGovVaultPendingRewards = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string) =>
    walletAddress ?
      state.user.balance.byAddress[walletAddress.toLowerCase()]?.tokenAmount.byGovVaultId[vaultId]
        ?.rewards
    : undefined,
  (state: BeefyState, _vaultId: VaultEntity['id'], _walletAddress?: string) =>
    state.entities.tokens.byChainId,
  (rewards, tokenByChainId) => {
    if (!rewards || rewards.length === 0) {
      return [];
    }

    return rewards.map(reward => {
      const token =
        tokenByChainId[reward.token.chainId]?.byAddress?.[reward.token.address.toLowerCase()];
      if (!token) {
        throw new Error(
          `selectGovVaultEarnedTokens: Unknown token address ${reward.token.address}`
        );
      }
      return { token, amount: reward.amount };
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
export const selectBoostBalanceTokenEntity = (
  state: BeefyState,
  boostId: BoostPromoEntity['id']
) => {
  const boost = selectBoostById(state, boostId);
  const boostedVault = selectVaultById(state, boost.vaultId);
  return selectTokenByAddress(state, boostedVault.chainId, boostedVault.contractAddress);
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
    breakdown && 'underlyingLiquidity' in breakdown ?
      new BigNumber(breakdown.underlyingLiquidity || 0)
    : BIG_ZERO;

  const userBalanceDecimal = selectUserVaultBalanceInDepositTokenIncludingDisplaced(
    state,
    vault.id,
    walletAddress
  );

  const userShareOfPool =
    lpTotalSupplyDecimal.gt(BIG_ZERO) ?
      userBalanceDecimal.dividedBy(lpTotalSupplyDecimal)
    : BIG_ZERO;

  const oneLpShareOfPool =
    lpTotalSupplyDecimal.gt(BIG_ZERO) ? BIG_ONE.dividedBy(lpTotalSupplyDecimal) : BIG_ZERO;

  const underlyingShareOfPool =
    underlyingTotalSupplyDecimal.gt(BIG_ZERO) ?
      underlyingTotalSupplyDecimal.dividedBy(underlyingTotalSupplyDecimal)
    : BIG_ZERO;

  const assets = breakdown.tokens.map((tokenAddress, i) => {
    const reserves = new BigNumber(breakdown.balances[i]);
    const underlyingReserves =
      breakdown && 'underlyingBalances' in breakdown ?
        new BigNumber(breakdown.underlyingBalances[i] || 0)
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

export const selectUserUnstakedClms = createSelector(
  (state: BeefyState, walletAddress?: string) => _selectWalletBalance(state, walletAddress),
  selectAllCowcentratedVaults,
  (userBalance, allCowcentratedVaults) => {
    if (!userBalance || userBalance.depositedVaultIds.length === 0) {
      return [];
    }

    return allCowcentratedVaults
      .filter(clm =>
        userBalance.tokenAmount.byChainId[clm.chainId]?.byTokenAddress[
          clm.receiptTokenAddress.toLocaleLowerCase()
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
    if (!userBalance || !vault || !isCowcentratedLikeVault(vault)) {
      return false;
    }

    const clmAddress = getCowcentratedAddressFromCowcentratedLikeVault(vault);
    return (
      userBalance.tokenAmount.byChainId[vault.chainId]?.byTokenAddress[
        clmAddress.toLowerCase()
      ]?.balance.gt(BIG_ZERO) || false
    );
  }
);
