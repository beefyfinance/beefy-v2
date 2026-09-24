import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type {
  InputTokenAmount,
  TransactQuote,
} from '../../../../../data/apis/transact/transact-types.ts';
import { isSharedBalanceToken, isTokenNative } from '../../../../../data/entities/token.ts';
import { selectSpendsWholeSharedBalance } from '../../../../../data/selectors/balance.ts';
import { selectSharedBalanceWrappedToken } from '../../../../../data/selectors/tokens.ts';
import type { BeefyState } from '../../../../../data/store/types.ts';
import { StepContent } from '../../../../../data/reducers/wallet/stepper-types.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectStepperStepContent } from '../../../../../data/selectors/stepper.ts';
import {
  selectTransactConfirmStatus,
  selectTransactDepositInputAmountExceedsBalance,
  selectTransactWithdrawInputAmountExceedsBalance,
} from '../../../../../data/selectors/transact.ts';

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

/**
 * Deposits of the whole gas token balance must leave gas behind. On same-balance chains (arc) the
 * wnative view spends the same funds as native, and being the deposit token it is typed in full by
 * hand often enough that the max flag alone would miss it.
 */
export function spendsAllGas(state: BeefyState, { token, amount, max }: InputTokenAmount): boolean {
  const sharesBalanceWithGas = isSharedBalanceToken(
    token,
    selectSharedBalanceWrappedToken(state, token.chainId)
  );
  if (!isTokenNative(token) && !sharesBalanceWithGas) {
    return false;
  }
  if (max) {
    return true;
  }
  return sharesBalanceWithGas && selectSpendsWholeSharedBalance(state, token.chainId, amount);
}

/** max-amount deposits of the gas token must leave gas behind, so the CTA is blocked */
export function useIsMaxGasTokenQuote(quote: TransactQuote): boolean {
  return useAppSelector(state =>
    quote.inputs.some(tokenAmount => spendsAllGas(state, tokenAmount))
  );
}

export function useMaxGasTokenSymbol(quote: TransactQuote): string | undefined {
  return useAppSelector(
    state => quote.inputs.find(tokenAmount => spendsAllGas(state, tokenAmount))?.token.symbol
  );
}
