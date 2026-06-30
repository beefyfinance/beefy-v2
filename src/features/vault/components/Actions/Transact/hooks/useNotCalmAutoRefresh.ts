import { useEffect, useRef, useState } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { transactFetchQuotes } from '../../../../../data/actions/transact.ts';
import { QuoteCowcentratedNotCalmError } from '../../../../../data/apis/transact/strategies/error.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactCrossChainPreflight,
  selectTransactInputAmounts,
  selectTransactInputMaxes,
  selectTransactMode,
  selectTransactQuoteError,
  selectTransactQuoteStatus,
  selectTransactSelected,
  selectTransactSelectedChainId,
  selectTransactSelectedSelectionId,
} from '../../../../../data/selectors/transact.ts';
import { selectIsWindowFocused } from '../../../../../data/selectors/window.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';

export const NOT_CALM_REFRESH_SECONDS = 10;

export type NotCalmAutoRefresh = {
  /** Keep the calm warning visible while a not-calm retry re-quote is in flight (no loader flicker). */
  showStickyNotCalmWarning: boolean;
  /** Run the title's auto-refresh countdown ring while we're retrying a not-calm deposit. */
  showNotCalmRefresh: boolean;
};

/**
 * CLM "not calm" deposit auto-refresh. When a deposit quote fails the on-chain calmness check we
 * re-quote every NOT_CALM_REFRESH_SECONDS until a calm quote comes back, pausing while the tab is
 * backgrounded. The visible countdown ring is drawn by ReloadSpinner, so all we need here is the
 * re-quote timer plus a sticky flag that keeps the warning from flickering to a loader during the
 * retry's brief Pending. Resets when the user changes what they're transacting.
 */
export function useNotCalmAutoRefresh(): NotCalmAutoRefresh {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);
  const selectionId = useAppSelector(selectTransactSelectedSelectionId);
  const selection = useAppSelector(selectTransactSelected);
  const inputAmounts = useAppSelector(selectTransactInputAmounts);
  const inputMaxes = useAppSelector(selectTransactInputMaxes);
  const chainId = useAppSelector(selectTransactSelectedChainId);
  const status = useAppSelector(selectTransactQuoteStatus);
  const quoteError = useAppSelector(selectTransactQuoteError);
  const preflightOk = useAppSelector(selectTransactCrossChainPreflight);
  const isWindowFocused = useAppSelector(selectIsWindowFocused);

  const isNotCalmDepositError =
    !!quoteError &&
    QuoteCowcentratedNotCalmError.match(quoteError) &&
    quoteError.action === 'deposit';

  // True from the first not-calm error until any other settled result (calm quote, different error,
  // or idle). Stays true across the retry's brief Pending so the warning doesn't flicker to a loader.
  const [retrying, setRetrying] = useState(false);
  useEffect(() => {
    if (isNotCalmDepositError) {
      setRetrying(true);
    } else if (status !== TransactStatus.Pending) {
      setRetrying(false);
    }
  }, [isNotCalmDepositError, status]);

  // Re-quote on a timer while not calm; pause while the tab is backgrounded so we don't re-quote the
  // zap api unattended (the timer re-arms from scratch when the tab is refocused).
  useEffect(() => {
    if (!isNotCalmDepositError || !isWindowFocused) {
      return;
    }
    const id = window.setTimeout(() => {
      const inputIsZero = inputAmounts.every(amount => amount.lte(BIG_ZERO));
      if (!inputIsZero && preflightOk) {
        dispatch(transactFetchQuotes());
      }
    }, NOT_CALM_REFRESH_SECONDS * 1000);
    return () => window.clearTimeout(id);
  }, [isNotCalmDepositError, isWindowFocused, inputAmounts, preflightOk, dispatch]);

  // Reset whenever the user changes what they're transacting.
  const skipInitialReset = useRef(true);
  useEffect(() => {
    if (skipInitialReset.current) {
      skipInitialReset.current = false;
      return;
    }
    setRetrying(false);
  }, [chainId, inputAmounts, inputMaxes, mode, selection, selectionId]);

  return {
    showStickyNotCalmWarning: status === TransactStatus.Pending && retrying,
    showNotCalmRefresh: retrying,
  };
}
