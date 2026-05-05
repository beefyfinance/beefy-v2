import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { orderBy } from 'lodash-es';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { extractTagFromLpSymbol } from '../../../helpers/tokens.ts';
import type { PulseHighlightProps } from '../../vault/components/PulseHighlight/PulseHighlight.tsx';
import type { BoostReward } from '../apis/balance/balance-types.ts';
import {
  type CrossChainChainOption,
  type CrossChainTokenOption,
  isCrossChainOption,
  type TokenAmount,
  type TransactOption,
  type TransactQuote,
} from '../apis/transact/transact-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { isSingleGovVault, type VaultEntity } from '../entities/vault.ts';
import { TransactStatus, type PendingCrossChainOp } from '../reducers/wallet/transact-types.ts';
import type { BeefyState } from '../store/types.ts';
import { valueOrThrow } from '../utils/selector-utils.ts';
import {
  selectAddressHasVaultPendingWithdrawal,
  selectBoostUserRewardsInToken,
  selectDepositOptionTokensBalanceByChainId,
  selectPastBoostIdsWithUserBalance,
  selectUserBalanceOfToken,
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInShareTokenIncludingDisplaced,
  selectUserVaultBalanceNotInActiveBoostInShareToken,
} from './balance.ts';
import { selectAllVaultBoostIds, selectPreStakeOrActiveBoostIds } from './boosts.ts';
import {
  selectVaultHasActiveGovRewards,
  selectVaultHasActiveMerklCampaigns,
  selectVaultHasActiveStellaSwapCampaigns,
} from './rewards.ts';
import { selectTokenPriceByAddress } from './tokens.ts';
import {
  selectConnectedUserHasGovRewardsForVault,
  selectConnectedUserHasMerklRewardsForVault,
  selectConnectedUserHasStellaSwapRewardsForVault,
} from './user-rewards.ts';
import { selectVaultById } from './vaults.ts';
import { selectWalletAddressIfKnown } from './wallet.ts';
import { selectChainById } from './chains.ts';
import {
  getSupportedChainIds,
  getBridgeFeeForUsdcAmount,
} from '../apis/transact/cctp/CCTPProvider.ts';

export const selectTransactStep = (state: BeefyState) => state.ui.transact.step;
export const selectTransactVaultId = (state: BeefyState) =>
  valueOrThrow(state.ui.transact.vaultId, 'No transact vaultId found');
export const selectTransactVaultIdOrUndefined = (state: BeefyState) => state.ui.transact.vaultId;
export const selectTransactPendingVaultIdOrUndefined = (state: BeefyState) =>
  state.ui.transact.pendingVaultId;

export const selectTransactMode = (state: BeefyState) => state.ui.transact.mode;
export const selectTransactSlippage = (state: BeefyState) => state.ui.transact.swapSlippage;

export const selectTransactOptionsStatus = (state: BeefyState) => state.ui.transact.options.status;
export const selectTransactOptionsError = (state: BeefyState) => state.ui.transact.options.error;

export const selectTransactFormIsLoading = (state: BeefyState) =>
  state.ui.transact.options.status === TransactStatus.Idle ||
  state.ui.transact.options.status === TransactStatus.Pending;

export const selectTransactOptionsVaultId = (state: BeefyState) =>
  state.ui.transact.options.vaultId;
export const selectTransactOptionsMode = (state: BeefyState) => state.ui.transact.options.mode;

export const selectTransactInputAmounts = (state: BeefyState) => state.ui.transact.inputAmounts;

export const selectTransactInputMaxes = (state: BeefyState) => state.ui.transact.inputMaxes;

export const selectTransactInputIndexAmount = (state: BeefyState, index: number) =>
  state.ui.transact.inputAmounts[index] || BIG_ZERO;

export const selectTransactInputIndexMax = (state: BeefyState, index: number) =>
  state.ui.transact.inputMaxes[index] || false;

export const selectTransactSelectedChainId = (state: BeefyState) =>
  state.ui.transact.selectedChainId;
export const selectTransactSelectedSelectionId = (state: BeefyState) =>
  valueOrThrow(state.ui.transact.selectedSelectionId, 'No selected selection id found');
export const selectTransactSelectedQuoteId = (state: BeefyState) =>
  state.ui.transact.selectedQuoteId;

export const selectTransactQuoteError = (state: BeefyState) => state.ui.transact.quotes.error;

export const selectTransactSelectedQuote = (state: BeefyState) =>
  valueOrThrow(selectTransactSelectedQuoteOrUndefined(state), 'No selected quote found');

export const selectTransactSelectedQuoteOrUndefined = createSelector(
  (state: BeefyState) => selectTransactSelectedQuoteId(state),
  (state: BeefyState) => state.ui.transact.quotes.byQuoteId,
  (id, byQuoteId) => {
    return id ? byQuoteId[id] : undefined;
  }
);

export const selectTransactQuoteById = createSelector(
  (_state: BeefyState, quoteId: TransactQuote['id']) => quoteId,
  (state: BeefyState) => state.ui.transact.quotes.byQuoteId,
  (id, byQuoteId) => {
    const quote = byQuoteId[id];
    if (!quote) {
      throw new Error(`No quote found for id ${id}`);
    }
    return quote;
  }
);

export const selectTransactQuoteStatus = (state: BeefyState) => state.ui.transact.quotes.status;

export const selectTransactQuoteIds = (state: BeefyState) => state.ui.transact.quotes.allQuoteIds;

export const selectTransactQuotes = createSelector(
  selectTransactQuoteIds,
  (state: BeefyState) => state.ui.transact.quotes.byQuoteId,
  (ids, byQuoteId) => ids.map(id => byQuoteId[id])
);

export const selectTransactSelectionById = createSelector(
  (_state: BeefyState, selectionId: TransactOption['selectionId']) => selectionId,
  (state: BeefyState) => state.ui.transact.selections.bySelectionId,
  (selectionId, bySelectionId) => bySelectionId[selectionId] || undefined
);

export const selectTransactSelected = createSelector(
  (state: BeefyState) => selectTransactSelectedSelectionId(state),
  (state: BeefyState) => state.ui.transact.selections.bySelectionId,
  (selectionId, bySelectionId) => bySelectionId[selectionId] || undefined
);

export const selectTransactDepositInputAmountExceedsBalance = (state: BeefyState) => {
  const selection = selectTransactSelected(state);
  const inputAmounts = selectTransactInputAmounts(state);
  const userBalances = selection.tokens.map(token =>
    selectUserBalanceOfToken(state, token.chainId, token.address)
  );
  return selection.tokens.some((_, index) =>
    (inputAmounts[index] || BIG_ZERO).gt(userBalances[index])
  );
};

export const selectTransactWithdrawInputAmountExceedsBalance = (state: BeefyState) => {
  const vaultId = selectTransactVaultId(state);
  const userBalance = selectUserVaultBalanceInDepositToken(state, vaultId);
  const value = selectTransactInputIndexAmount(state, 0);

  return value.gt(userBalance);
};

export const selectTransactTokenChains = (state: BeefyState) =>
  state.ui.transact.selections.allChainIds;

export const selectTransactNumTokens = (state: BeefyState) =>
  state.ui.transact.selections.allSelectionIds.length;

export const selectTransactWithdrawSelectionsForChain = (
  state: BeefyState,
  chainId: ChainEntity['id']
) => {
  const selectionsForChain = state.ui.transact.selections.byChainId[chainId];
  if (!selectionsForChain) {
    return [];
  }

  return selectionsForChain.map(
    selectionId => state.ui.transact.selections.bySelectionId[selectionId]
  );
};

export const selectTransactWithdrawSelectionsForChainWithBalances = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  if (!walletAddress) {
    walletAddress = selectWalletAddressIfKnown(state);
  }

  const selections = selectTransactWithdrawSelectionsForChain(state, chainId).map(selection => ({
    ...selection,
    decimals: 0,
    balanceValue: BIG_ZERO,
    balance: undefined,
    tag: undefined,
  }));
  const vault = selectVaultById(state, vaultId);

  const selectionsWithModifiedSymbols = selections.map(selection => {
    return { ...selection, ...extractTagFromLpSymbol(selection.tokens, vault) };
  });

  if (!walletAddress) {
    return selectionsWithModifiedSymbols;
  }

  return orderBy(
    selectionsWithModifiedSymbols.map(selection => {
      if (selection.tokens.length === 1) {
        const token = selection.tokens[0];
        const price = selectTokenPriceByAddress(state, token.chainId, token.address);
        const balance = selectUserBalanceOfToken(
          state,
          token.chainId,
          token.address,
          walletAddress
        );

        return {
          ...selection,
          balance,
          decimals: token.decimals,
          price,
          balanceValue: balance.multipliedBy(price),
        };
      }

      return selection;
    }),
    [o => o.order, o => o.balanceValue.toNumber()],
    ['asc', 'desc']
  );
};

export const selectTransactDepositTokensForChainIdWithBalances = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  vaultId: VaultEntity['id']
) => {
  const walletAddress = selectWalletAddressIfKnown(state);
  const selectionsForChain = state.ui.transact.selections.byChainId[chainId];
  if (!selectionsForChain) {
    return [];
  }
  const vault = selectVaultById(state, vaultId);
  const options = selectionsForChain.map(
    selectionId => state.ui.transact.selections.bySelectionId[selectionId]
  );

  return orderBy(
    options
      .map(option => {
        const tokens = option.tokens;
        const balances = tokens.map(token =>
          selectUserBalanceOfToken(state, token.chainId, token.address, walletAddress)
        );
        const prices = tokens.map(token =>
          selectTokenPriceByAddress(state, token.chainId, token.address)
        );
        const balanceValues = balances.map((balance, index) => balance.multipliedBy(prices[index]));
        const balanceValueTotal = balanceValues.reduce((acc, value) => acc.plus(value), BIG_ZERO);

        const optionWithBalances = {
          ...option,
          balances,
          prices,
          balanceValues,
          balanceValue: balanceValueTotal,
          balance: undefined,
          decimals: 0,
          price: undefined,
          tag: undefined,
        };

        if (tokens.length === 1) {
          return {
            ...optionWithBalances,
            ...extractTagFromLpSymbol(tokens, vault),
            balance: balances[0],
            decimals: tokens[0].decimals,
            price: prices[0],
          };
        }

        return optionWithBalances;
      })
      .filter(option => !option.hideIfZeroBalance || !option.balanceValue.isZero()),
    [o => o.order, o => o.balanceValue.toNumber()],
    ['asc', 'desc']
  );
};

export const selectTransactOptionById = createSelector(
  (_state: BeefyState, optionId: string) => optionId,
  (state: BeefyState) => state.ui.transact.options.byOptionId,
  (optionId, byOptionId): TransactOption => byOptionId[optionId]
);

export const selectTransactOptionIdsForSelectionId = createSelector(
  (_state: BeefyState, selectionId: string) => selectionId,
  (state: BeefyState) => state.ui.transact.options.bySelectionId,
  (selectionId, bySelectionId) => bySelectionId[selectionId]
);

export const selectTransactOptionsForSelectionId = createSelector(
  (state: BeefyState, selectionId: string) =>
    selectTransactOptionIdsForSelectionId(state, selectionId),
  (state: BeefyState) => state.ui.transact.options.byOptionId,
  (optionIds, byOptionId) => optionIds.map(id => byOptionId[id])
);

export function selectTokenAmountsTotalValue(
  state: BeefyState,
  tokenAmounts: TokenAmount[]
): BigNumber {
  return BigNumber.sum(
    ...tokenAmounts.map(tokenAmount => selectTokenAmountValue(state, tokenAmount))
  );
}

export function selectTokenAmountValue(state: BeefyState, tokenAmount: TokenAmount): BigNumber {
  return selectTokenPriceByAddress(
    state,
    tokenAmount.token.chainId,
    tokenAmount.token.address
  ).multipliedBy(tokenAmount.amount);
}

export const selectTransactExecuting = (state: BeefyState) => state.ui.transact.executing;
export const selectTransactConfirmStatus = (state: BeefyState) => state.ui.transact.confirm.status;
export const selectTransactConfirmError = (state: BeefyState) => state.ui.transact.confirm.error;
export const selectTransactConfirmChanges = (state: BeefyState) =>
  state.ui.transact.confirm.changes;

/** True when "quote has changed, please confirm" is shown — button should be enabled so user can confirm with new quote */
export const selectTransactConfirmNeededWithChanges = createSelector(
  [selectTransactConfirmStatus, selectTransactConfirmChanges],
  (status, changes) => status === TransactStatus.Fulfilled && changes != null && changes.length > 0
);

export const selectTransactForceSelection = (state: BeefyState) => state.ui.transact.forceSelection;

export const selectTransactVaultHasCrossChainZap = (state: BeefyState) => {
  const byOptionId = state.ui.transact.options.byOptionId;
  return Object.values(byOptionId).some(option => option.strategyId === 'cross-chain');
};

const CROSS_CHAIN_PREFLIGHT_SAFETY_BUFFER = 0.05;

export function selectTransactCrossChainPreflight(state: BeefyState): boolean {
  const selectionId = state.ui.transact.selectedSelectionId;
  if (!selectionId) return true;

  const selection = selectTransactSelectionById(state, selectionId);
  if (!selection) return true;

  const inputAmounts = selectTransactInputAmounts(state);
  if (inputAmounts.length === 0 || inputAmounts.some(amount => amount.lte(BIG_ZERO))) {
    return true;
  }

  const options = selectTransactOptionsForSelectionId(state, selectionId);
  if (options.length === 0 || !options.every(isCrossChainOption)) return true;
  const option = options[0];

  const slippage = selectTransactSlippage(state);
  const slippageDivisor = 1 - slippage - CROSS_CHAIN_PREFLIGHT_SAFETY_BUFFER;
  if (slippageDivisor <= 0) return true;

  const inputUsd = BigNumber.sum(
    ...selection.tokens.map((token, i) =>
      selectTokenAmountValue(state, { token, amount: inputAmounts[i] || BIG_ZERO })
    )
  );

  const usdcPriceUsd = selectTokenPriceByAddress(
    state,
    option.bridgeToken.chainId,
    option.bridgeToken.address
  );
  const feeUsdc = getBridgeFeeForUsdcAmount(
    option.sourceChainId,
    option.destChainId,
    inputUsd,
    option.bridgeToken.decimals
  );
  const feeUsd = feeUsdc.multipliedBy(usdcPriceUsd);
  const requiredInputUsd = feeUsd.dividedBy(slippageDivisor);
  return inputUsd.gte(requiredInputUsd);
}

/**
 * Returns the list of chains available for cross-chain deposit, sorted as:
 * 1. Chains with balance before chains without
 * 2. Among chains with balance, sorted by USD balance descending
 * 3. Among chains with $0 balance, sorted alphabetically by chain name
 */
export const selectCrossChainSortedChains = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): CrossChainChainOption[] => {
  const vault = selectVaultById(state, vaultId);
  const cctpChainIds = getSupportedChainIds();
  // Deduplicated set: vault chain + supported source chains
  const allChainIds = Array.from(new Set([vault.chainId, ...cctpChainIds]));

  const walletAddress = selectWalletAddressIfKnown(state);
  const chainsWithBalance: CrossChainChainOption[] = allChainIds.map(chainId => {
    const chain = selectChainById(state, chainId);
    const totalBalanceUsd =
      walletAddress ?
        selectDepositOptionTokensBalanceByChainId(state, chainId, walletAddress)
      : BIG_ZERO;

    const selectionIds = state.ui.transact.selections.byChainId[chainId];
    const seenAddresses = new Set<string>();
    const tokenOptions: CrossChainTokenOption[] = [];
    if (selectionIds) {
      for (const selectionId of selectionIds) {
        const selection = state.ui.transact.selections.bySelectionId[selectionId];
        if (!selection) continue;
        for (const token of selection.tokens) {
          const key = `${token.chainId}:${token.address.toLowerCase()}`;
          if (seenAddresses.has(key)) continue;
          seenAddresses.add(key);
          let tokenBalanceUsd = BIG_ZERO;
          if (walletAddress) {
            const balance = selectUserBalanceOfToken(
              state,
              token.chainId,
              token.address,
              walletAddress
            );
            const price = selectTokenPriceByAddress(state, token.chainId, token.address);
            tokenBalanceUsd = balance.multipliedBy(price);
          }
          tokenOptions.push({ token, balanceUsd: tokenBalanceUsd });
        }
      }
    }

    const sortedTokens = orderBy(
      tokenOptions,
      [o => o.balanceUsd.toNumber(), o => o.token.symbol.toLowerCase()],
      ['desc', 'asc']
    );

    const tokensWithBalance = sortedTokens.filter(o => o.balanceUsd.gt(BIG_ZERO));

    return {
      chainId,
      chainName: chain.name,
      balanceUsd: totalBalanceUsd,
      tokens: tokensWithBalance,
    };
  });

  return orderBy(
    chainsWithBalance,
    [
      // 1. Chains with balance before chains without
      o => (o.balanceUsd.isGreaterThan(BIG_ZERO) ? 0 : 1),
      // 2. Among chains with balance, sort by balance descending
      o => o.balanceUsd.toNumber(),
      // 3. Among chains with $0 balance, sort alphabetically by chain name
      o => o.chainName.toLowerCase(),
    ],
    ['asc', 'desc', 'asc']
  );
};

export const selectTransactShouldShowClaims = createSelector(
  selectVaultById,
  selectVaultHasActiveGovRewards,
  selectConnectedUserHasGovRewardsForVault,
  selectVaultHasActiveMerklCampaigns,
  selectConnectedUserHasMerklRewardsForVault,
  selectVaultHasActiveStellaSwapCampaigns,
  selectConnectedUserHasStellaSwapRewardsForVault,
  (
    vault,
    vaultHasActiveGovRewards,
    userHasUnclaimedGovRewards,
    vaultHasActiveMerklCampaigns,
    userHasUnclaimedMerklRewards,
    vaultHasActiveStellaSwapCampaigns,
    userHasUnclaimedStellaSwapRewards
  ) => {
    // single gov vault do not have periodFinish/rewardRate data
    return (
      isSingleGovVault(vault) ||
      vaultHasActiveGovRewards ||
      vaultHasActiveMerklCampaigns ||
      vaultHasActiveStellaSwapCampaigns ||
      userHasUnclaimedGovRewards ||
      userHasUnclaimedMerklRewards ||
      userHasUnclaimedStellaSwapRewards
    );
  }
);

export const selectTransactShouldShowClaimsNotification = createSelector(
  selectConnectedUserHasGovRewardsForVault,
  selectConnectedUserHasMerklRewardsForVault,
  selectConnectedUserHasStellaSwapRewardsForVault,
  (
    userHasUnclaimedGovRewards,
    userHasUnclaimedMerklRewards,
    userHasUnclaimedStellaSwapRewards
  ): PulseHighlightProps['variant'] | false => {
    return (
        userHasUnclaimedGovRewards ||
          userHasUnclaimedMerklRewards ||
          userHasUnclaimedStellaSwapRewards
      ) ?
        'success'
      : false;
  }
);

export const selectTransactShouldShowBoost = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const activeOrPrestakeIds = selectPreStakeOrActiveBoostIds(state, vaultId);
  if (activeOrPrestakeIds.length > 0) {
    return true;
  }

  // OR, there is an expired boost which the user is still staked in
  return selectPastBoostIdsWithUserBalance(state, vaultId).length > 0;
};

export const selectTransactShouldShowBoostNotification = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): PulseHighlightProps['variant'] | false => {
  // unclaimed rewards: green
  const boosts = selectAllVaultBoostIds(state, vaultId);
  for (const boostId of boosts) {
    const boostRewards = selectBoostUserRewardsInToken(state, boostId, walletAddress) || [];
    if (boostRewards.some((reward: BoostReward) => reward.amount.gt(BIG_ZERO))) {
      return 'success';
    }
  }

  // in vault but not in boost: yellow
  if (
    selectUserVaultBalanceInShareTokenIncludingDisplaced(state, vaultId).gt(BIG_ZERO) &&
    selectUserVaultBalanceNotInActiveBoostInShareToken(state, vaultId).gt(BIG_ZERO)
  ) {
    return 'warning';
  }

  return false;
};

export const selectTransactShouldShowWithdrawNotification = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): PulseHighlightProps['variant'] | false => {
  const requests = selectAddressHasVaultPendingWithdrawal(state, vaultId, walletAddress);
  switch (requests) {
    case 'claimable': {
      return 'success';
    }
    case 'pending': {
      return 'warning';
    }
    case false: {
      return false;
    }
    default: {
      throw new Error(`Unknown pending withdrawal status: ${requests}`);
    }
  }
};

// ---------------------------------------------------------------------------
// Cross-chain operation selectors
// ---------------------------------------------------------------------------

export const selectCrossChainPendingOps = createSelector(
  (state: BeefyState) => state.ui.transact.crossChain,
  (crossChain): PendingCrossChainOp[] =>
    crossChain.pendingOpIds.map(id => crossChain.pendingOps[id]).filter(Boolean)
);

export const selectCrossChainPendingOpById = (state: BeefyState, opId: string) =>
  state.ui.transact.crossChain.pendingOps[opId];

export const selectCrossChainRecoverableOps = createSelector(
  selectCrossChainPendingOps,
  (ops): PendingCrossChainOp[] => ops.filter(op => op.status === 'dest-failed')
);

/** Dest-failed op for the current transact vault, if any (most recent by updatedAt). Used to show recovery UI after modal close. */
export const selectRecoveryOpForCurrentVault = createSelector(
  [(state: BeefyState) => state.ui.transact.vaultId, selectCrossChainRecoverableOps],
  (vaultId, recoverableOps): PendingCrossChainOp | undefined => {
    if (!vaultId) return undefined;
    const forVault = recoverableOps.filter(op => op.vaultId === vaultId);
    if (forVault.length === 0) return undefined;
    return orderBy(forVault, 'updatedAt', 'desc')[0];
  }
);

export const selectCrossChainActiveOps = createSelector(
  selectCrossChainPendingOps,
  (ops): PendingCrossChainOp[] =>
    ops.filter(op => op.status !== 'dest-done' && op.status !== 'dest-recovered')
);

export const selectCrossChainRecoveryQuoteStatus = (state: BeefyState) =>
  state.ui.transact.crossChain.recoveryQuote.status;

export const selectCrossChainRecoveryQuote = (state: BeefyState) =>
  state.ui.transact.crossChain.recoveryQuote.quote;

export const selectCrossChainRecoveryQuoteOpId = (state: BeefyState) =>
  state.ui.transact.crossChain.recoveryQuote.opId;

export const selectCrossChainRecoveryQuoteError = (state: BeefyState) =>
  state.ui.transact.crossChain.recoveryQuote.error;

export const selectTransactSuccessClosed = (state: BeefyState) => state.ui.transact.successClosed;
