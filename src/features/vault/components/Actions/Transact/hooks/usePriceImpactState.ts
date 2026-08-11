import { useMemo, useState } from 'react';
import type { TransactQuote } from '../../../../../data/apis/transact/transact-types.ts';
import {
  isCowcentratedDepositQuote,
  isZapQuote,
} from '../../../../../data/apis/transact/transact-types.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';

const IMPACT_WARN_PERCENT = 1 / 100;
const IMPACT_CONFIRM_PERCENT = 5 / 100;

export type PriceImpactState = {
  shouldWarn: boolean;
  shouldConfirm: boolean;
  priceImpact: number;
  confirmed: boolean;
  setConfirmed: (confirmed: boolean) => void;
  /** action must stay disabled until a high-impact quote is explicitly confirmed */
  isDisabled: boolean;
};

/**
 * Derived during render, never in an effect: effects commit after paint, so deriving there left a
 * painted frame in which a quote that had just crossed the confirm threshold was still clickable.
 *
 * The confirmation is dropped on every change to the values it was given for, so re-quoting always
 * costs the user a fresh tick — including impact going x -> y -> x, where keying on the value alone
 * would silently re-arm a tick the user gave for an earlier quote.
 */
export function usePriceImpactState(quote: TransactQuote | undefined): PriceImpactState {
  const zapQuote = quote && isZapQuote(quote) ? quote : undefined;
  const priceImpact = zapQuote?.priceImpact ?? 0;
  const isInvalidCowcentratedDeposit =
    !!quote &&
    isCowcentratedDepositQuote(quote) &&
    quote.outputs.every(output => output.amount.lte(BIG_ZERO));

  const [confirmed, setConfirmed] = useState(false);

  // reset during render rather than in an effect, so the ungated frame never paints
  const resetKey = `${!!zapQuote}:${priceImpact}:${isInvalidCowcentratedDeposit}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    setConfirmed(false);
  }

  return useMemo(() => {
    const shouldWarn =
      !!zapQuote && priceImpact >= IMPACT_WARN_PERCENT && !isInvalidCowcentratedDeposit;
    const shouldConfirm = shouldWarn && priceImpact >= IMPACT_CONFIRM_PERCENT;
    const isConfirmed = shouldConfirm && confirmed;

    return {
      shouldWarn,
      shouldConfirm,
      priceImpact,
      confirmed: isConfirmed,
      setConfirmed,
      isDisabled: shouldConfirm && !isConfirmed,
    };
  }, [zapQuote, priceImpact, isInvalidCowcentratedDeposit, confirmed]);
}
