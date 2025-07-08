import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { createCachedSelector } from 're-reselect';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number.ts';
import { getUnixNow } from '../../../helpers/date.ts';
import { entries, keys } from '../../../helpers/object.ts';
import type { BoostReward } from '../apis/balance/balance-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { BoostPromoEntity } from '../entities/promo.ts';
import type { TokenEntity, TokenLpBreakdown } from '../entities/token.ts';
import {
  isCowcentratedLikeVault,
  isErc4626Vault,
  isGovVault,
  isSingleGovVault,
  isStandardVault,
  isVaultWithReceipt,
  type VaultEntity,
  type VaultGov,
} from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { mooAmountToOracleAmount } from '../utils/ppfs.ts';
import {
  areArraysEqual,
  arrayOrStaticEmpty,
  bigNumberEqualityCheck,
  bigNumberOrStaticZero,
  valueOrThrow,
} from '../utils/selector-utils.ts';
import { getCowcentratedAddressFromCowcentratedLikeVault } from '../utils/vault-utils.ts';
import type { UserLpBreakdownBalance } from './balance-types.ts';
import {
  selectAllVaultBoostIds,
  selectBoostById,
  selectIsVaultPreStakedOrBoosted,
  selectPastVaultBoostIds,
  selectVaultCurrentBoostId,
} from './boosts.ts';
import { selectIsConfigAvailable } from './config.ts';
import { createAddressChainDataSelector, hasLoaderFulfilledOnce } from './data-loader-helpers.ts';
import { selectIsPricesAvailable } from './prices.ts';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
  selectTokensByChainId,
} from './tokens.ts';
import {
  selectAllCowcentratedVaults,
  selectGovVaultById,
  selectVaultById,
  selectVaultIdsByChainIdIncludingHidden,
} from './vaults.ts';
import { selectWalletAddress } from './wallet.ts';

// @dev this is fine not being a cached selector, as it only calls cached selectors
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
)((_state: BeefyState, walletAddress: string) => walletAddress.toLocaleLowerCase());

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

export const selectUserDepositedVaultIdsForAsset = createSelector(
  [(state: BeefyState) => state, (_state: BeefyState, asset: string) => asset],
  (state, asset) => {
    const vaultIds = selectUserDepositedVaultIds(state);
    return vaultIds.filter(vaultId => {
      const vault = selectVaultById(state, vaultId);
      return vault.assetIds.includes(asset);
    });
  }
);

export const selectHasUserDepositedOnChain = createSelector(
  (state: BeefyState, _chainId: ChainEntity['id'], walletAddress?: string) =>
    selectUserDepositedVaultIds(state, walletAddress),
  (state: BeefyState, chainId: ChainEntity['id']) =>
    selectVaultIdsByChainIdIncludingHidden(state, chainId),
  (depositedIds, chainVaultIds) => {
    return depositedIds && depositedIds.some(depositedId => chainVaultIds.includes(depositedId));
  }
);

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
 * Only includes shares deposited in boosts, converted to deposit token
 */
export const selectUserVaultBalanceInDepositTokenInBoosts = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenInBoosts(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectVaultSharesToDepositTokenData(state, vaultId),
  (shares, shareData) =>
    shareData.shareToken ?
      mooAmountToOracleAmount(shareData.shareToken, shareData.depositToken, shareData.ppfs, shares)
    : shares
)((_state: BeefyState, vaultId: VaultEntity['id'], _maybeWalletAddress?: string) => vaultId);

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
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string) =>
    selectUserVaultPendingWithdrawalOrUndefined(state, vaultId, walletAddress),
  // only recalculate after 30s if requests state hasn't changed
  (_state: BeefyState) => Math.trunc(Date.now() / 30_000) * 30,
  (pending, _roundedTimestamp): 'claimable' | 'pending' | false => {
    if (!pending || !pending.requests.length) {
      return false;
    }
    const now = getUnixNow();
    return pending.requests.some(request => now >= request.claimableTimestamp) ?
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
    return isVaultWithReceipt(vault) ?
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
 * Does not include pending withdrawal
 */
export const selectUserVaultBalanceNotInActiveBoostInShareToken = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareToken(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenInBoosts(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenInBridged(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], maybeWalletAddress?: string) =>
    selectUserVaultBalanceInShareTokenInCurrentBoost(state, vaultId, maybeWalletAddress),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectIsVaultPreStakedOrBoosted(state, vaultId),
  (inVault, inBoosts, inBridge, inCurrentBoost, isBoosted) => {
    if (isBoosted) {
      return bigNumberOrStaticZero(inVault.plus(inBoosts).plus(inBridge).minus(inCurrentBoost));
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

export const selectVaultUserBalanceInDepositTokenBreakdown = createSelector(
  [
    selectVaultById,
    selectVaultSharesToDepositTokenData,
    selectUserVaultBalanceInDepositToken,
    (_state: BeefyState, _vaultId: VaultEntity['id'], walletAddress?: string) => walletAddress,
    (state: BeefyState, _vaultId: VaultEntity['id'], _walletAddress?: string) => state,
  ],
  (vault, shareData, vaultBalance, walletAddress, state) => {
    const balances: UserVaultBalanceBreakdown = {
      depositToken: shareData.depositToken,
      entries: [],
    };

    if (vaultBalance.gt(BIG_ZERO)) {
      balances.entries.push({
        type: 'vault',
        id: `vault-${vault.id}`,
        vaultId: vault.id,
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
        vault.id,
        walletAddress
      );
      if (pendingWithdrawal.gt(BIG_ZERO)) {
        balances.entries.push({
          type: 'pending-withdrawal',
          id: `pending-withdrawal-${vault.id}`,
          vaultId: vault.id,
          amount: mooAmountToOracleAmount(
            shareData.shareToken,
            shareData.depositToken,
            shareData.ppfs,
            pendingWithdrawal
          ),
        });
      }
    }

    // deposits in boost (even those expired)
    if (isVaultWithReceipt(vault)) {
      const boostIds = selectAllVaultBoostIds(state, vault.id);
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
    }

    // bridged mooToken
    if (isStandardVault(vault)) {
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
    }

    return balances;
  }
);

export const selectGovVaultUserStakedBalanceInDepositToken = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount.byGovVaultId[vaultId]?.balance || BIG_ZERO;
};

/**
 * @dev this returns a new function that only changes when .byBoostId changes for the wallet
 * could use _selectWalletBalance(state, walletAddress)?.tokenAmount.byBoostId as a dependency directly,
 * this just abstracts away the details
 */
const selectGetBoostUserBalanceInTokenFn = createSelector(
  [
    (state: BeefyState, walletAddress?: string) =>
      _selectWalletBalance(state, walletAddress)?.tokenAmount.byBoostId,
  ],
  byBoostId => (boostId: BoostPromoEntity['id']) => {
    return bigNumberOrStaticZero(byBoostId?.[boostId]?.balance);
  }
);

// TODO remove original
export const selectBoostUserBalanceInTokenOriginal = (
  state: BeefyState,
  boostId: BoostPromoEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount?.byBoostId[boostId]?.balance || BIG_ZERO;
};

/**
 * v2
 * - re-use selectGetBoostUserBalanceInTokenFn
 * - resultEqualityCheck ensures existing reference is returned if balance has not changed
 */
export const selectBoostUserBalanceInToken = createSelector(
  [
    (state: BeefyState, _boostId: BoostPromoEntity['id'], walletAddress?: string) =>
      selectGetBoostUserBalanceInTokenFn(state, walletAddress),
    (_state: BeefyState, boostId: BoostPromoEntity['id']) => boostId,
  ],
  (getBoostUserBalanceInToken, boostId) => getBoostUserBalanceInToken(boostId),
  {
    memoizeOptions: {
      resultEqualityCheck: bigNumberEqualityCheck,
    },
  }
);

const NO_REWARDS: BoostReward[] = [];

/**
 * @dev, this returns a new function that only changes when .byBoostId changes for the wallet
 */
const selectGetBoostUserRewardsInTokenFn = createSelector(
  [
    (state: BeefyState, walletAddress?: string) =>
      _selectWalletBalance(state, walletAddress)?.tokenAmount.byBoostId,
  ],
  byBoostId => (boostId: BoostPromoEntity['id']) => {
    return byBoostId?.[boostId]?.rewards || NO_REWARDS;
  }
);

// TODO remove original
export const selectBoostUserRewardsInTokenOriginal = (
  state: BeefyState,
  boostId: BoostPromoEntity['id'],
  walletAddress?: string
) => {
  const walletBalance = _selectWalletBalance(state, walletAddress);
  return walletBalance?.tokenAmount?.byBoostId[boostId]?.rewards || NO_REWARDS;
};

function boostRewardEqualityCheck(a: BoostReward, b: BoostReward): boolean {
  return (
    a === b ||
    (a.amount.isEqualTo(b.amount) &&
      a.index == b.index &&
      a.token.chainId === b.token.chainId &&
      a.token.address === b.token.address &&
      a.token.oracleId === b.token.oracleId &&
      a.token.symbol === b.token.symbol &&
      a.token.decimals === b.token.decimals)
  );
}

/**
 * v2
 * - re-use selectGetBoostUserRewardsInTokenFn
 * - resultEqualityCheck ensures existing reference is returned if rewards have not changed
 */
export const selectBoostUserRewardsInToken = createSelector(
  [
    (state: BeefyState, _boostId: BoostPromoEntity['id'], walletAddress?: string) =>
      selectGetBoostUserRewardsInTokenFn(state, walletAddress),
    (_state: BeefyState, boostId: BoostPromoEntity['id']) => boostId,
  ],
  (getBoostUserRewardsInToken, boostId) => getBoostUserRewardsInToken(boostId),
  {
    memoizeOptions: {
      resultEqualityCheck: (a: BoostReward[], b: BoostReward[]) =>
        areArraysEqual(a, b, boostRewardEqualityCheck),
    },
  }
);

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

export const selectUserLpBreakdownBalance = createSelector(
  [
    (
      _state: BeefyState,
      vault: VaultEntity,
      _breakdown: TokenLpBreakdown,
      _walletAddress?: string
    ) => vault,
    (
      _state: BeefyState,
      _vault: VaultEntity,
      breakdown: TokenLpBreakdown,
      _walletAddress?: string
    ) => breakdown,
    (
      _state: BeefyState,
      _vault: VaultEntity,
      _breakdown: TokenLpBreakdown,
      walletAddress?: string
    ) => walletAddress,
    (
      state: BeefyState,
      _vault: VaultEntity,
      _breakdown: TokenLpBreakdown,
      _walletAddress?: string
    ) => state,
  ],
  (vault, breakdown, walletAddress, state): UserLpBreakdownBalance => {
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
  }
);

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
export const selectIsUserBalanceAvailable = createSelector(
  (state: BeefyState, _walletAddress: string | undefined) => selectIsConfigAvailable(state),
  (state: BeefyState, _walletAddress: string | undefined) => selectIsPricesAvailable(state),
  (state: BeefyState, _walletAddress: string | undefined) => state.ui.dataLoader.byChainId,
  (state: BeefyState, _walletAddress: string | undefined) => state.ui.dataLoader.byAddress,
  (_state: BeefyState, walletAddress: string | undefined) => walletAddress?.toLowerCase(),
  (configAvailable, pricesAvailable, byChainId, byAddress, walletAddress) => {
    if (!configAvailable || !pricesAvailable || !walletAddress) {
      return false;
    }
    for (const chainId of keys(byChainId)) {
      // if any chain has balance data, then balance data is available
      if (
        hasLoaderFulfilledOnce(byChainId[chainId]?.contractData) &&
        hasLoaderFulfilledOnce(byAddress[walletAddress]?.byChainId[chainId]?.balance)
      ) {
        return true;
      }
    }
    // if no chain has balance data
    // then balance data is unavailable
    return false;
  }
);
export const selectIsBalanceAvailableForChainUser = createAddressChainDataSelector(
  'balance',
  hasLoaderFulfilledOnce
);

/**
 * v2
 * @dev note as of reselect v5, createSelector uses {@link https://reselect.js.org/api/weakmapmemoize/|weakMapMemoize} by default, which caches based on inputs to `combiner`,
 * (so if all `inputSelectors` return the same value (reference), the `combiner` will not be called again).
 * That should mean createCachedSelector isn't needed here...
 */
export const selectPastBoostIdsWithUserBalance = createSelector(
  [
    (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress?: string) =>
      selectPastVaultBoostIds(state, vaultId),
    (state: BeefyState, _vaultId: VaultEntity['id'], walletAddress?: string) =>
      selectGetBoostUserBalanceInTokenFn(state, walletAddress),
    (state: BeefyState, _vaultId: VaultEntity['id'], walletAddress?: string) =>
      selectGetBoostUserRewardsInTokenFn(state, walletAddress),
  ],
  (expiredBoostIds, getBoostUserBalanceInToken, getBoostUserRewardsInToken) => {
    const boostIds: string[] = [];
    for (const eolBoostId of expiredBoostIds) {
      const userBalance = getBoostUserBalanceInToken(eolBoostId);
      if (userBalance.gt(0)) {
        boostIds.push(eolBoostId);
        continue;
      }
      const userRewards = getBoostUserRewardsInToken(eolBoostId);
      if (userRewards?.some(r => r.amount.gt(0))) {
        boostIds.push(eolBoostId);
      }
    }
    return arrayOrStaticEmpty(boostIds.sort());
  },
  {
    memoizeOptions: {
      // @dev, balances/rewards objects can change, but result in no change to list of boostIds
      resultEqualityCheck: areArraysEqual<string>,
    },
  }
);

// TODO remove original
export const selectPastBoostIdsWithUserBalanceOriginal = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const expiredBoostIds = selectPastVaultBoostIds(state, vaultId);

  const boostIds: string[] = [];
  for (const eolBoostId of expiredBoostIds) {
    const userBalance = selectBoostUserBalanceInToken(state, eolBoostId);
    if (userBalance.gt(0)) {
      boostIds.push(eolBoostId);
      continue;
    }
    const userRewards = selectBoostUserRewardsInToken(state, eolBoostId);
    if (userRewards?.some(r => r.amount.gt(0))) {
      boostIds.push(eolBoostId);
    }
  }
  return boostIds;
};
