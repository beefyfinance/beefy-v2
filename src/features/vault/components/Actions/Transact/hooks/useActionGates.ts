import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { TransactQuote } from '../../../../../data/apis/transact/transact-types.ts';
import { isTokenNative } from '../../../../../data/entities/token.ts';
import { StepContent } from '../../../../../data/reducers/wallet/stepper-types.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectStepperStepContent } from '../../../../../data/selectors/stepper.ts';
import {
  selectTransactConfirmStatus,
  selectTransactDepositInputAmountExceedsBalance,
  selectTransactWithdrawInputAmountExceedsBalance,
} from '../../../../../data/selectors/transact.ts';

/**
 * Gates that decide whether the deposit/withdraw CTA is disabled.
 *
 * These are read by the action components directly rather than pushed up from the notice
 * components through an effect: an effect commits after paint, which left a frame where the CTA
 * was still clickable after the condition that should have blocked it became true. Every input
 * here is already in the store (or on the quote), so the notice and its parent can derive the
 * same answer independently and stay in lockstep.
 */

export function useNotEnoughDisabled(mode: 'deposit' | 'withdraw'): boolean {
  const inputAmountExceedsBalance = useAppSelector(
    mode === 'deposit' ?
      selectTransactDepositInputAmountExceedsBalance
    : selectTransactWithdrawInputAmountExceedsBalance
  );
  const stepContent = useAppSelector(selectStepperStepContent);
  const isBridging =
    stepContent === StepContent.BridgingTx || stepContent === StepContent.SuccessTx;

  return isBridging ? false : inputAmountExceedsBalance;
}

export function useConfirmDisabled(): boolean {
  const status = useAppSelector(selectTransactConfirmStatus);
  return status === TransactStatus.Rejected || status === TransactStatus.Pending;
}

/** max-amount deposits of the native token must leave gas behind, so the CTA is blocked */
export function isMaxNativeQuote(quote: TransactQuote): boolean {
  return quote.inputs.some(tokenAmount => tokenAmount.max && isTokenNative(tokenAmount.token));
}
