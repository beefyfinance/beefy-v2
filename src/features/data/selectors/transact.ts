import { BeefyState } from '../../../redux-types';
import { createSelector } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { first } from 'lodash';
import { selectTokenByAddress, selectTokenPriceByAddress } from './tokens';
import { selectWalletAddressIfKnown } from './wallet';
import { selectUserBalanceOfToken } from './balance';
import { TokenAmount, TransactOption, TransactQuote } from '../apis/transact/transact-types';
import BigNumber from 'bignumber.js';
import { TransactStatus } from '../reducers/wallet/transact-types';

export const selectTransactStep = (state: BeefyState) => state.ui.transact.step;
export const selectTransactVaultId = (state: BeefyState) => state.ui.transact.vaultId;
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

export const selectTransactInputAmount = (state: BeefyState) => state.ui.transact.inputAmount;
export const selectTransactInputMax = (state: BeefyState) => state.ui.transact.inputMax;

export const selectTransactSelectedChainId = (state: BeefyState) =>
  state.ui.transact.selectedChainId;
export const selectTransactSelectedTokensId = (state: BeefyState) =>
  state.ui.transact.selectedTokensId;
export const selectTransactSelectedQuoteId = (state: BeefyState) =>
  state.ui.transact.selectedQuoteId;

export const selectTransactQuoteError = (state: BeefyState) => state.ui.transact.quotes.error;

export const selectTransactSelectedQuote = createSelector(
  (state: BeefyState) => selectTransactSelectedQuoteId(state),
  (state: BeefyState) => state.ui.transact.quotes.byQuoteId,
  (id, byQuoteId) => (id ? byQuoteId[id] || null : null)
);

export const selectTransactQuoteById = createSelector(
  (state: BeefyState, quoteId: TransactQuote['id']) => quoteId,
  (state: BeefyState) => state.ui.transact.quotes.byQuoteId,
  (id, byQuoteId) => (id ? byQuoteId[id] || null : null)
);

export const selectTransactQuoteStatus = (state: BeefyState) => state.ui.transact.quotes.status;

export const selectTransactQuoteIds = (state: BeefyState) => state.ui.transact.quotes.allQuoteIds;

export const selectTransactQuotes = createSelector(
  selectTransactQuoteIds,
  (state: BeefyState) => state.ui.transact.quotes.byQuoteId,
  (ids, byQuoteId) => ids.map(id => byQuoteId[id])
);

export const selectTransactTokensIdTokenAddresses = createSelector(
  (state: BeefyState, tokensId: TransactOption['tokensId']) => tokensId,
  (state: BeefyState) => state.ui.transact.tokens.byTokensId,
  (tokensId, byTokensId) => byTokensId[tokensId] || []
);

export const selectTransactTokensIdTokens = createSelector(
  (state: BeefyState) => selectTransactSelectedChainId(state),
  (state: BeefyState, tokensId: TransactOption['tokensId']) =>
    selectTransactTokensIdTokenAddresses(state, tokensId),
  (state: BeefyState) => state.entities.tokens.byChainId,
  (chainId, tokenAddresses, byChainId) =>
    tokenAddresses.map(address => byChainId[chainId].byAddress[address.toLowerCase()])
);

export const selectTransactSelectedTokenAddresses = createSelector(
  (state: BeefyState) => selectTransactSelectedTokensId(state),
  (state: BeefyState) => state.ui.transact.tokens.byTokensId,
  (tokensId, byTokensId) => byTokensId[tokensId] || []
);

export const selectTransactSelectedTokens = createSelector(
  (state: BeefyState) => selectTransactSelectedChainId(state),
  (state: BeefyState) => selectTransactSelectedTokenAddresses(state),
  (state: BeefyState) => state.entities.tokens.byChainId,
  (chainId, tokenAddresses, byChainId) =>
    tokenAddresses.map(address => byChainId[chainId].byAddress[address.toLowerCase()])
);

export const selectTransactTokenChains = (state: BeefyState) =>
  state.ui.transact.tokens.allChainIds;

export const selectTransactNumTokens = (state: BeefyState) =>
  state.ui.transact.tokens.allTokensIds.length;

export const selectTransactWithdrawTokensForChain = (
  state: BeefyState,
  chainId: ChainEntity['id']
) => {
  const tokensForChain = state.ui.transact.tokens.byChainId[chainId];
  const options = tokensForChain.map(tokensId => ({
    tokensId: tokensId,
    tokenAddresses: state.ui.transact.tokens.byTokensId[tokensId],
  }));

  return options.map(option => {
    const tokens = option.tokenAddresses.map(address =>
      selectTokenByAddress(state, chainId, address)
    );

    return {
      id: option.tokensId,
      tokens,
    };
  });
};

export const selectTransactDepositTokensForChainIdWithBalances = (
  state: BeefyState,
  chainId: ChainEntity['id']
) => {
  const walletAddress = selectWalletAddressIfKnown(state);
  const tokensForChain = state.ui.transact.tokens.byChainId[chainId];

  // We can just take the first option, as we only care about the token, not the option at this stage
  const options = tokensForChain.map(tokensId => ({
    tokensId: tokensId,
    tokenAddresses: state.ui.transact.tokens.byTokensId[tokensId],
  }));

  return options
    .filter(option => option.tokenAddresses.length === 1) // can only deposit 1 token
    .map(option => {
      const tokens = option.tokenAddresses.map(address =>
        selectTokenByAddress(state, chainId, address)
      );
      const token = first(tokens);
      const balance = selectUserBalanceOfToken(state, token.chainId, token.address, walletAddress);
      const price = selectTokenPriceByAddress(state, token.chainId, token.address);

      return {
        id: option.tokensId,
        tokens,
        balance,
        price,
        balanceValue: balance.multipliedBy(price),
      };
    });
};

export const selectTransactOptionById = createSelector(
  (state: BeefyState, optionId: string) => optionId,
  (state: BeefyState) => state.ui.transact.options.byOptionId,
  (optionId, byOptionId): TransactOption => byOptionId[optionId]
);

export const selectTransactOptionIdsForTokensId = createSelector(
  (state: BeefyState, tokensId: string) => tokensId,
  (state: BeefyState) => state.ui.transact.options.byTokensId,
  (tokensId, byTokensId) => byTokensId[tokensId]
);

export const selectTransactOptionsForTokensId = createSelector(
  (state: BeefyState, tokensId: string) => selectTransactOptionIdsForTokensId(state, tokensId),
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
