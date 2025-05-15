import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { orderBy } from 'lodash-es';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { extractTagFromLpSymbol } from '../../../helpers/tokens.ts';
import type { PulseHighlightProps } from '../../vault/components/PulseHighlight/PulseHighlight.tsx';
import type { BoostReward } from '../apis/balance/balance-types.ts';
import {
  type TokenAmount,
  type TransactOption,
  type TransactQuote,
} from '../apis/transact/transact-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { isSingleGovVault, type VaultEntity } from '../entities/vault.ts';
import { TransactStatus } from '../reducers/wallet/transact-types.ts';
import type { BeefyState } from '../store/types.ts';
import { valueOrThrow } from '../utils/selector-utils.ts';
import {
  selectAddressHasVaultPendingWithdrawal,
  selectBoostUserRewardsInToken,
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

export const selectTransactConfirmStatus = (state: BeefyState) => state.ui.transact.confirm.status;
export const selectTransactConfirmError = (state: BeefyState) => state.ui.transact.confirm.error;
export const selectTransactConfirmChanges = (state: BeefyState) =>
  state.ui.transact.confirm.changes;

export const selectTransactForceSelection = (state: BeefyState) => state.ui.transact.forceSelection;

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
