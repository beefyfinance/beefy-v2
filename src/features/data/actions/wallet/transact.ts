import { nanoid } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { getTransactApi } from '../../apis/instances.ts';
import { serializeError } from '../../apis/transact/strategies/error.ts';
import {
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
import { selectTransactSlippage } from '../../selectors/transact.ts';
import type { BeefyStateFn, BeefyThunk } from '../../store/types.ts';
import {
  transactConfirmNeeded,
  transactConfirmPending,
  transactConfirmRejected,
  transactConfirmUnneeded,
} from '../transact.ts';
import { approve } from './approval.ts';
import { claimGovVault } from './gov.ts';
import { stepperReset, stepperStartWithSteps } from './stepper.ts';

export async function getTransactSteps(
  quote: TransactQuote,
  t: TFunction<Namespace>,
  getState: BeefyStateFn
): Promise<Step[]> {
  const steps: Step[] = [];
  const state = getState();
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

  let originalStep: Step;
  if (isDepositQuote(quote)) {
    originalStep = await api.fetchDepositStep(quote, getState, t);
  } else if (isWithdrawQuote(quote)) {
    originalStep = await api.fetchWithdrawStep(quote, getState, t);
  } else {
    throw new Error(`Invalid quote`);
  }

  steps.push(wrapStepConfirmQuote(originalStep, quote));

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
function wrapStepConfirmQuote(originalStep: Step, originalQuote: TransactQuote): Step {
  const action: BeefyThunk = async function (dispatch, getState) {
    const requestId = nanoid();
    dispatch(transactConfirmPending({ requestId }));

    try {
      const api = await getTransactApi();
      const option = originalQuote.option;
      let quotes: TransactQuote[];
      if (isDepositOption(option)) {
        quotes = await api.fetchDepositQuotesFor([option], originalQuote.inputs, getState);
      } else if (isWithdrawOption(option)) {
        quotes = await api.fetchWithdrawQuotesFor([option], originalQuote.inputs, getState);
      } else {
        throw new Error(`Invalid option`);
      }

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
      if (significantChanges.length === 0) {
        dispatch(
          transactConfirmUnneeded({
            requestId,
            newQuote,
            originalQuoteId: originalQuote.id,
          })
        );
        return await originalStep.action(dispatch, getState, undefined);
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
