import { useCallback, useMemo, useState } from 'react';
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
 * The confirmation is stored against the impact it was given for, so any re-quote drops it.
 */
export function usePriceImpactState(quote: TransactQuote | undefined): PriceImpactState {
  const [confirmedFor, setConfirmedFor] = useState<number | undefined>(undefined);

  const zapQuote = quote && isZapQuote(quote) ? quote : undefined;
  const priceImpact = zapQuote?.priceImpact ?? 0;
  const isInvalidCowcentratedDeposit =
    !!quote &&
    isCowcentratedDepositQuote(quote) &&
    quote.outputs.every(output => output.amount.lte(BIG_ZERO));

  const setConfirmed = useCallback(
    (confirmed: boolean) => setConfirmedFor(confirmed ? priceImpact : undefined),
    [priceImpact]
  );

  return useMemo(() => {
    const shouldWarn =
      !!zapQuote && priceImpact >= IMPACT_WARN_PERCENT && !isInvalidCowcentratedDeposit;
    const shouldConfirm = shouldWarn && priceImpact >= IMPACT_CONFIRM_PERCENT;
    const confirmed = shouldConfirm && confirmedFor === priceImpact;

    return {
      shouldWarn,
      shouldConfirm,
      priceImpact,
      confirmed,
      setConfirmed,
      isDisabled: shouldConfirm && !confirmed,
    };
  }, [zapQuote, priceImpact, isInvalidCowcentratedDeposit, confirmedFor, setConfirmed]);
}
