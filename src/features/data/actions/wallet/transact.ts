import { nanoid } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { getTransactApi } from '../../apis/instances.ts';
import { serializeError } from '../../apis/transact/strategies/error.ts';
import {
  isCrossChainOption,
  isDepositOption,
  isDepositQuote,
  isWithdrawOption,
  isWithdrawQuote,
  type QuoteOutputTokenAmountChange,
  type TransactQuote,
} from '../../apis/transact/transact-types.ts';
import { isTokenEqual, isTokenErc20 } from '../../entities/token.ts';
import type { VaultGov } from '../../entities/vault.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import { selectAllowanceByTokenAddress } from '../../selectors/allowances.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { selectTransactSlippage } from '../../selectors/transact.ts';
import type { BeefyStateFn, BeefyThunk } from '../../store/types.ts';
import {
  transactConfirmNeeded,
  transactConfirmPending,
  transactConfirmRejected,
  transactConfirmUnneeded,
} from '../transact.ts';
import { approve } from './approval.ts';
import { prefetchGasPrice } from './cross-chain.ts';
import { claimGovVault } from './gov.ts';
import { stepperReset, stepperStartWithSteps } from './stepper.ts';

type PrefetchedRequote = {
  promise: Promise<TransactQuote[]>;
  startedAt: number;
};

const REQUOTE_MAX_AGE_MS = 30_000;

export async function getTransactSteps(
  quote: TransactQuote,
  t: TFunction<Namespace>,
  getState: BeefyStateFn
): Promise<Step[]> {
  const steps: Step[] = [];
  const state = getState();
  const isCrossChain = isCrossChainOption(quote.option);
  console.log('[transact] getTransactSteps: start', {
    strategyId: quote.option.strategyId,
    isCrossChain,
  });

  // Prefetch gas price for cross-chain options (runs in background, consumed by crossChainZapExecuteOrder)
  if (isCrossChainOption(quote.option)) {
    const sourceChain = selectChainById(state, quote.option.sourceChainId);
    prefetchGasPrice(sourceChain);
    console.log('[transact] getTransactSteps: gas price prefetch initiated', {
      sourceChainId: quote.option.sourceChainId,
    });
  }

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
          action: approve(
            allowanceTokenAmount.token,
            allowanceTokenAmount.spenderAddress,
            allowanceTokenAmount.amount
          ),
          pending: false,
        });
      }
    }
  }

  // Kick off re-quote prefetch in parallel with step building.
  // Both use independent strategy instances (confirmed safe by audit).
  let requotePromise: Promise<TransactQuote[]>;
  const option = quote.option;
  if (isDepositOption(option)) {
    requotePromise = api.fetchDepositQuotesFor([option], quote.inputs, getState);
  } else if (isWithdrawOption(option)) {
    requotePromise = api.fetchWithdrawQuotesFor([option], quote.inputs, getState);
  } else {
    throw new Error(`Invalid quote`);
  }
  const prefetchedRequote: PrefetchedRequote = {
    promise: requotePromise,
    startedAt: Date.now(),
  };
  console.log('[transact] getTransactSteps: requote prefetch started');

  // Suppress unhandled rejection if step-build fails first and nobody awaits this
  requotePromise.catch(() => {});

  // Build the step (~5-8s, re-quote runs in parallel)
  console.log('[transact] getTransactSteps: building step');
  let originalStep: Step;
  if (isDepositQuote(quote)) {
    originalStep = await api.fetchDepositStep(quote, getState, t);
  } else if (isWithdrawQuote(quote)) {
    originalStep = await api.fetchWithdrawStep(quote, getState, t);
  } else {
    throw new Error(`Invalid quote`);
  }
  console.log('[transact] getTransactSteps: step built');

  steps.push(wrapStepConfirmQuote(originalStep, quote, prefetchedRequote));

  console.log('[transact] getTransactSteps: done', { stepCount: steps.length });
  return steps;
}

/**
 * Steps to deposit into or withdraw from a vault
 * Builds allowance steps from quote data,
 * then asks quote provider for the deposit/withdraw step,
 * which is wrapped to provide quote recheck/confirm functionality
 */
export function transactSteps(quote: TransactQuote, t: TFunction<Namespace>): BeefyThunk {
  return async function (dispatch, getState) {
    const steps = await getTransactSteps(quote, t, getState);
    dispatch(stepperStartWithSteps(steps, quote.inputs[0].token.chainId));
  };
}

/**
 * Special steps builder for gov (earnings) vault claim button
 */
export function transactStepsClaimGov(vault: VaultGov, t: TFunction<Namespace>): BeefyThunk {
  return async function (dispatch, _getState) {
    dispatch(
      stepperStartWithSteps(
        [
          {
            step: 'claim-gov',
            message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
            action: claimGovVault(vault),
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
 * Needed as we (may) have allowance TXs to perform first
 */
function wrapStepConfirmQuote(
  originalStep: Step,
  originalQuote: TransactQuote,
  prefetchedRequote: PrefetchedRequote
): Step {
  const action: BeefyThunk = async function (dispatch, getState) {
    const requestId = nanoid();
    dispatch(transactConfirmPending({ requestId }));
    console.log('[transact] wrapStepConfirmQuote: start');

    try {
      let quotes: TransactQuote[];
      const prefetchAge = Date.now() - prefetchedRequote.startedAt;
      console.log('[transact] wrapStepConfirmQuote: prefetch age', {
        prefetchAge,
        maxAge: REQUOTE_MAX_AGE_MS,
      });

      if (prefetchAge < REQUOTE_MAX_AGE_MS) {
        // Prefetch is still fresh — try to use it
        try {
          console.log('[transact] wrapStepConfirmQuote: using prefetched requote');
          quotes = await prefetchedRequote.promise;
        } catch {
          // Prefetch failed — fall back to fresh re-quote
          console.log('[transact] wrapStepConfirmQuote: prefetch failed, fetching fresh');
          quotes = await fetchFreshRequote(originalQuote, getState);
        }
      } else {
        // Prefetch is stale (user took >30s with approvals) — fetch fresh
        console.log('[transact] wrapStepConfirmQuote: prefetch stale, fetching fresh');
        quotes = await fetchFreshRequote(originalQuote, getState);
      }
      console.log('[transact] wrapStepConfirmQuote: requote resolved');

      const state = getState();
      const maxSlippage = selectTransactSlippage(state);
      const newQuote = quotes.find(quote => quote.option.id === originalQuote.option.id);
      const minAllowedRatio = new BigNumber(1 - maxSlippage * 0.1); // max 10% of slippage lower
      console.log('minAllowedRatio', minAllowedRatio.toString(10));

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
          const newAmount = newOutput ? newOutput.amount : BIG_ZERO;
          significantChanges.push({
            ...originalOutput,
            newAmount,
            difference: newAmount.minus(originalOutput.amount),
          });
        }
      }

      // Perform original action if no changes
      console.log('[transact] wrapStepConfirmQuote: comparison done', {
        significantChanges: significantChanges.length,
      });
      if (significantChanges.length === 0) {
        dispatch(
          transactConfirmUnneeded({
            requestId,
            newQuote,
            originalQuoteId: originalQuote.id,
          })
        );
        const result = await originalStep.action(dispatch, getState, undefined);
        return result;
      }

      console.debug('original', originalQuote);
      console.debug('new', newQuote);
      console.debug(
        'changes',
        significantChanges
          .map(change => `${change.difference.toString(10)} ${change.token.symbol}`)
          .join(',\n')
      );

      // Hide stepper (as UI will now show confirm notice)
      dispatch(stepperReset());
      dispatch(
        transactConfirmNeeded({
          requestId,
          changes: significantChanges,
          newQuote,
          originalQuoteId: originalQuote.id,
        })
      );
    } catch (error) {
      // Hide stepper (as UI will now show error)
      dispatch(stepperReset());
      dispatch(transactConfirmRejected({ requestId, error: serializeError(error) }));
      return;
    }
  };

  return {
    ...originalStep,
    action,
  };
}

async function fetchFreshRequote(
  originalQuote: TransactQuote,
  getState: BeefyStateFn
): Promise<TransactQuote[]> {
  const api = await getTransactApi();
  const option = originalQuote.option;
  if (isDepositOption(option)) {
    return api.fetchDepositQuotesFor([option], originalQuote.inputs, getState);
  } else if (isWithdrawOption(option)) {
    return api.fetchWithdrawQuotesFor([option], originalQuote.inputs, getState);
  } else {
    throw new Error(`Invalid option`);
  }
}
