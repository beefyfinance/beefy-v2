import { createAsyncThunk, miniSerializeError, nanoid } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { VaultEntity, VaultGov } from '../entities/vault';
import { selectVaultById } from '../selectors/vaults';
import { selectShouldInitAddressBook } from '../selectors/data-loader';
import { fetchAddressBookAction } from './tokens';
import { isInitialLoader } from '../reducers/data-loader-types';
import { fetchAllZapsAction } from './zap';
import { getTransactApi } from '../apis/instances';
import { transactActions } from '../reducers/wallet/transact';
import {
  selectTokenAmountsTotalValue,
  selectTransactInputAmount,
  selectTransactInputMax,
  selectTransactOptionById,
  selectTransactOptionsForTokensId,
  selectTransactOptionsMode,
  selectTransactOptionsVaultId,
  selectTransactSelectedChainId,
  selectTransactSelectedQuote,
  selectTransactSelectedTokensId,
  selectTransactTokensIdTokens,
  selectTransactVaultId,
} from '../selectors/transact';
import {
  InputTokenAmount,
  ITransactApi,
  QuoteOutputTokenAmountChange,
  QuoteTokenAmount,
  TransactOption,
  TransactQuote,
} from '../apis/transact/transact-types';
import { BIG_ZERO } from '../../../helpers/big-number';
import { ChainEntity } from '../entities/chain';
import { isTokenEqual, isTokenErc20, TokenEntity } from '../entities/token';
import { BigNumber } from 'bignumber.js';
import { Namespace, TFunction } from 'react-i18next';
import { Step, stepperActions } from '../reducers/wallet/stepper';
import { selectAllowanceByTokenAddress } from '../selectors/allowances';
import { walletActions } from './wallet-actions';
import { ThunkAction } from 'redux-thunk';
import { startStepperWithSteps } from './stepper';
import { KeysOfType } from '../utils/types-utils';
import { TransactMode } from '../reducers/wallet/transact-types';
import { selectTokenByAddress } from '../selectors/tokens';
import { first, groupBy, uniqBy } from 'lodash';
import { fetchAllowanceAction } from './allowance';
import { fetchAllAmmsAction } from './amm';
import { fetchFees } from './fees';
import { uniqueTokens } from '../../../helpers/tokens';
import { fetchBalanceAction } from './balance';

export type TransactInitArgs = {
  vaultId: VaultEntity['id'];
};

export type TransactInitPayload = {};

export const transactInit = createAsyncThunk<
  TransactInitPayload,
  TransactInitArgs,
  { state: BeefyState }
>(
  'transact/init',
  async ({ vaultId }, { getState, dispatch }) => {
    const vault = selectVaultById(getState(), vaultId);
    const loaders = [];

    if (selectShouldInitAddressBook(getState(), vault.chainId)) {
      loaders.push(dispatch(fetchAddressBookAction({ chainId: vault.chainId })));
    }

    const ammsLoader = getState().ui.dataLoader.global.amms;
    if (ammsLoader && isInitialLoader(ammsLoader)) {
      loaders.push(dispatch(fetchAllAmmsAction()));
    }

    const zapsLoader = getState().ui.dataLoader.global.zaps;
    if (zapsLoader && isInitialLoader(zapsLoader)) {
      loaders.push(dispatch(fetchAllZapsAction()));
    }

    const feesLoader = getState().ui.dataLoader.global.fees;
    if (feesLoader && isInitialLoader(feesLoader)) {
      loaders.push(dispatch(fetchFees()));
    }

    await Promise.all(loaders);
  },
  {
    condition({ vaultId }, { getState }) {
      // only dispatch if needed
      return selectTransactVaultId(getState()) !== vaultId;
    },
  }
);

export type TransactFetchOptionsArgs = {
  vaultId: VaultEntity['id'];
  mode: TransactMode;
};

export type TransactFetchOptionsPayload = {
  options: TransactOption[];
};

const optionsForByMode: Record<
  TransactMode,
  KeysOfType<ITransactApi, ITransactApi['getDepositOptionsFor']>
> = {
  [TransactMode.Deposit]: 'getDepositOptionsFor',
  [TransactMode.Withdraw]: 'getWithdrawOptionsFor',
};
export const transactFetchOptions = createAsyncThunk<
  TransactFetchOptionsPayload,
  TransactFetchOptionsArgs,
  { state: BeefyState }
>(
  'transact/fetchOptions',
  async ({ vaultId, mode }, { getState, dispatch }) => {
    const api = await getTransactApi();
    const state = getState();
    const method = optionsForByMode[mode];
    const options = await api[method](vaultId, state);

    if (!options || options.length === 0) {
      throw new Error(`No transact options available.`);
    }

    // update balances
    const vault = selectVaultById(state, vaultId);
    const tokens = getUniqueTokensForOptions(options, state);
    const tokensByChain = groupBy(tokens, token => token.chainId);
    await Promise.all(
      Object.values(tokensByChain).map(tokens =>
        dispatch(
          fetchBalanceAction({
            chainId: tokens[0].chainId,
            tokens: tokens,
            vaults: tokens[0].chainId === vault.chainId ? [vault] : [],
          })
        )
      )
    );

    return {
      options: options,
    };
  },
  {
    condition({ vaultId, mode }, { getState }) {
      const state = getState();

      return (
        selectTransactOptionsMode(state) !== mode ||
        selectTransactVaultId(state) !== selectTransactOptionsVaultId(state)
      );
    },
  }
);

function getUniqueTokensForOptions(options: TransactOption[], state: BeefyState): TokenEntity[] {
  const tokens = options.flatMap(option => {
    return option.tokenAddresses.map(tokenAddress => {
      return selectTokenByAddress(state, option.chainId, tokenAddress);
    });
  });

  return uniqueTokens(tokens);
}

export type TransactFetchDepositQuotesPayload = {
  tokensId: string;
  chainId: ChainEntity['id'];
  inputAmounts: QuoteTokenAmount[];
  quotes: TransactQuote[];
};

const quotesForByMode: Record<
  TransactMode,
  KeysOfType<ITransactApi, ITransactApi['getDepositQuotesFor']>
> = {
  [TransactMode.Deposit]: 'getDepositQuotesFor',
  [TransactMode.Withdraw]: 'getWithdrawQuotesFor',
};
export const transactFetchQuotes = createAsyncThunk<
  TransactFetchDepositQuotesPayload,
  void,
  { state: BeefyState }
>('transact/fetchQuotes', async (_, { getState, dispatch }) => {
  const api = await getTransactApi();
  const state = getState();
  const mode = selectTransactOptionsMode(state);
  const inputAmount = selectTransactInputAmount(state);
  const inputMax = selectTransactInputMax(state);
  if (inputAmount.lte(BIG_ZERO)) {
    throw new Error(`Can not quote for 0`);
  }

  const tokensId = selectTransactSelectedTokensId(state);
  if (!tokensId) {
    throw new Error(`No tokensId selected`);
  }

  const chainId = selectTransactSelectedChainId(state);
  if (!chainId) {
    throw new Error(`No chainId selected`);
  }

  const options = selectTransactOptionsForTokensId(state, tokensId);
  if (!options || options.length === 0) {
    throw new Error(`No options for tokensId ${tokensId}`);
  }

  const tokens = selectTransactTokensIdTokens(state, tokensId);
  if (!tokens || tokens.length === 0) {
    throw new Error(`No tokens for tokensId ${tokensId}`);
  }

  const vaultId = selectTransactVaultId(state);
  const vault = selectVaultById(state, vaultId);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

  // TODO handle differently for univ3 with multiple deposit tokens
  const inputAmounts: InputTokenAmount[] = [
    {
      amount: inputAmount,
      token: mode === TransactMode.Withdraw ? depositToken : tokens[0], // for withdraw this is always depositToken
      max: inputMax,
    },
  ];

  const method = quotesForByMode[mode];
  const quotes = await api[method](options, inputAmounts, state);

  quotes.sort((a, b) => {
    const valueA = selectTokenAmountsTotalValue(state, a.outputs);
    const valueB = selectTokenAmountsTotalValue(state, b.outputs);
    return valueB.comparedTo(valueA);
  });

  // update allowances
  const uniqueAllowances = uniqBy(
    quotes.map(quote => quote.allowances).flat(),
    allowance => `${allowance.token.chainId}-${allowance.spenderAddress}-${allowance.token.address}`
  );
  const allowancesPerChainSpender = groupBy(
    uniqueAllowances,
    allowance => `${allowance.token.chainId}-${allowance.spenderAddress}`
  );

  await Promise.all(
    Object.values(allowancesPerChainSpender).map(allowances =>
      dispatch(
        fetchAllowanceAction({
          chainId: allowances[0].token.chainId,
          spenderAddress: allowances[0].spenderAddress,
          tokens: allowances.map(allowance => allowance.token),
        })
      )
    )
  );

  return {
    tokensId,
    chainId,
    inputAmounts,
    quotes,
  };
});

export const transactFetchQuotesIfNeeded = createAsyncThunk<void, void, { state: BeefyState }>(
  'transact/fetchQuotesIfNeeded',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const quote = selectTransactSelectedQuote(state);
    let shouldFetch = true;

    if (quote) {
      const option = selectTransactOptionById(state, quote.optionId);
      const vaultId = selectTransactVaultId(state);
      const chainId = selectTransactSelectedChainId(state);
      const tokensId = selectTransactSelectedTokensId(state);
      const inputAmount = selectTransactInputAmount(state);
      const input = first(quote.inputs);

      shouldFetch =
        option.chainId !== chainId ||
        option.vaultId !== vaultId ||
        option.tokensId !== tokensId ||
        !input.amount.eq(inputAmount);
    }

    if (shouldFetch) {
      dispatch(transactFetchQuotes());
    }
  }
);

const actionForByMode: Record<
  TransactMode,
  KeysOfType<ITransactApi, ITransactApi['getDepositStep']>
> = {
  [TransactMode.Deposit]: 'getDepositStep',
  [TransactMode.Withdraw]: 'getWithdrawStep',
};

/**
 * Steps to deposit into or withdraw from a vault
 * Builds allowance steps from quote data,
 * then asks quote provider for the deposit/withdraw step,
 * which is wrapped to provide quote recheck/confirm functionality
 */
export function transactSteps(
  quote: TransactQuote,
  t: TFunction<Namespace>
): ThunkAction<void, BeefyState, void, any> {
  return async function (dispatch, getState) {
    const steps: Step[] = [];
    const state = getState();
    const option = selectTransactOptionById(state, quote.optionId);
    const api = await getTransactApi();

    for (const allowanceTokenAmount of quote.allowances) {
      if (isTokenErc20(allowanceTokenAmount.token)) {
        const allowance = selectAllowanceByTokenAddress(
          state,
          allowanceTokenAmount.token.chainId,
          allowanceTokenAmount.token.address,
          allowanceTokenAmount.spenderAddress
        );

        if (allowance.lt(allowanceTokenAmount.amount)) {
          steps.push({
            step: 'approve',
            message: t('Vault-ApproveMsg'),
            action: walletActions.approval(
              allowanceTokenAmount.token,
              allowanceTokenAmount.spenderAddress
            ),
            pending: false,
          });
        }
      }
    }

    const method = actionForByMode[option.mode];
    const originalStep = await api[method](quote, option, state, t);
    steps.push(wrapStepConfirmQuote(originalStep, quote));

    dispatch(startStepperWithSteps(steps, quote.inputs[0].token.chainId));
  };
}

/**
 * Special steps builder for gov (earnings) vault claim button
 */
export function transactStepsClaimGov(
  vault: VaultGov,
  t: TFunction<Namespace>
): ThunkAction<void, BeefyState, void, any> {
  return async function (dispatch, getState) {
    dispatch(
      startStepperWithSteps(
        [
          {
            step: 'claim-gov',
            message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
            action: walletActions.claimGovVault(vault),
            pending: false,
          },
        ],
        vault.chainId
      )
    );
  };
}

/**
 * Wraps a step action in order to confirm the quote is still valid before performing the TX
 */
function wrapStepConfirmQuote(originalStep: Step, originalQuote: TransactQuote): Step {
  const action = async function (dispatch, getState) {
    const requestId = nanoid();
    dispatch(transactActions.confirmPending({ requestId }));

    try {
      const state = getState();
      const api = await getTransactApi();
      const option = selectTransactOptionById(state, originalQuote.optionId);
      const mode = option.mode;
      const method = quotesForByMode[mode];
      const quotes = await api[method]([option], originalQuote.inputs, state);
      const newQuote = quotes.find(quote => quote.optionId === originalQuote.optionId);
      const minAllowedRatio = new BigNumber('0.995'); // max 0.5% lower

      if (!newQuote) {
        throw new Error(`Failed to get new quote.`);
      }

      const significantChanges: QuoteOutputTokenAmountChange[] = [];
      for (const originalOutput of originalQuote.outputs) {
        const newOutput = newQuote.outputs.find(output =>
          isTokenEqual(originalOutput.token, output.token)
        );

        if (
          !newOutput ||
          newOutput.amount.lt(originalOutput.amount.multipliedBy(minAllowedRatio))
        ) {
          significantChanges.push({
            ...originalOutput,
            newAmount: newOutput.amount,
            difference: newOutput.amount.minus(originalOutput.amount),
          });
        }
      }

      console.debug('original', originalQuote);
      console.debug('new', newQuote);
      console.debug(
        'changes',
        significantChanges
          .map(change => `${change.difference.toString(10)} ${change.token.symbol}`)
          .join(',\n')
      );

      // Perform original action if no changes
      if (significantChanges.length === 0) {
        dispatch(transactActions.confirmUnneeded({ requestId }));
        return await originalStep.action(dispatch, getState, undefined);
      }

      // Hide stepper (as UI will now show confirm notice)
      dispatch(stepperActions.reset());
      dispatch(
        transactActions.confirmNeeded({
          requestId,
          changes: significantChanges,
          newQuote,
          originalQuoteId: originalQuote.id,
        })
      );
    } catch (error) {
      // Hide stepper (as UI will now show error)
      dispatch(stepperActions.reset());
      dispatch(transactActions.confirmRejected({ requestId, error: miniSerializeError(error) }));
      return;
    }
  };

  return {
    ...originalStep,
    action,
  };
}
