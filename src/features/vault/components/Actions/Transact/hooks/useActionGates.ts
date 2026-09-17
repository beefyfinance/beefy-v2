import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { TransactQuote } from '../../../../../data/apis/transact/transact-types.ts';
import { nativeAndWrappedAreSame } from '../../../../../data/apis/transact/helpers/tokens.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { isTokenEqual, isTokenNative } from '../../../../../data/entities/token.ts';
import { selectChainWrappedNativeToken } from '../../../../../data/selectors/tokens.ts';
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

/** on same-balance chains (arc) the wnative view spends the same funds as native, so it pays gas */
function isGasToken(state: BeefyState, token: TokenEntity): boolean {
  if (isTokenNative(token)) {
    return true;
  }
  if (!nativeAndWrappedAreSame(token.chainId)) {
    return false;
  }
  return isTokenEqual(token, selectChainWrappedNativeToken(state, token.chainId));
}

/** max-amount deposits of the gas token must leave gas behind, so the CTA is blocked */
export function useIsMaxGasTokenQuote(quote: TransactQuote): boolean {
  return useAppSelector(state =>
    quote.inputs.some(tokenAmount => tokenAmount.max && isGasToken(state, tokenAmount.token))
  );
}

/** symbol of the maxed gas token, if any */
export function useMaxGasTokenSymbol(quote: TransactQuote): string | undefined {
  return useAppSelector(
    state =>
      quote.inputs.find(tokenAmount => tokenAmount.max && isGasToken(state, tokenAmount.token))
        ?.token.symbol
  );
}
