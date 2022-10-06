import { BeefyState } from '../../../redux-types';
import { createSelector } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { first } from 'lodash';
import { selectTokenByAddress, selectTokenPriceByAddress } from './tokens';
import { selectWalletAddressIfKnown } from './wallet';
import { selectUserBalanceOfToken } from './balance';
import { TransactStatus } from '../reducers/wallet/transact';

export const selectTransactStep = (state: BeefyState) => state.ui.transact.step;
export const selectTransactVaultId = (state: BeefyState) => state.ui.transact.vaultId;
export const selectTransactMode = (state: BeefyState) => state.ui.transact.mode;

export const selectTransactFormIsLoading = (state: BeefyState) =>
  state.ui.transact.options.status === TransactStatus.Idle ||
  state.ui.transact.options.status === TransactStatus.Pending;

export const selectTransactOptionsVaultId = (state: BeefyState) =>
  state.ui.transact.options.vaultId;
export const selectTransactOptionsMode = (state: BeefyState) => state.ui.transact.options.mode;

export const selectTransactInputAmount = (state: BeefyState) => state.ui.transact.inputAmount;

export const selectTransactSelectedChainId = (state: BeefyState) =>
  state.ui.transact.selectedChainId;
export const selectTransactSelectedTokensId = (state: BeefyState) =>
  state.ui.transact.selectedTokensId;
export const selectTransactSelectedQuoteId = (state: BeefyState) =>
  state.ui.transact.selectedQuoteId;

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
        token: token,
        tokens,
        balance,
        price,
        balanceValue: balance.multipliedBy(price),
      };
    });
};

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
