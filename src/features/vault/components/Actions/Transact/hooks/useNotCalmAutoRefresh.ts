import { useEffect, useRef, useState } from 'react';
import { QuoteCowcentratedNotCalmError } from '../../../../../data/apis/transact/strategies/error.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
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
import { useAppSelector } from '../../../../../data/store/hooks.ts';

export const NOT_CALM_REFRESH_SECONDS = 10;

export type NotCalmAutoRefresh = {
  /** Keep the calm warning visible while a not-calm retry re-quote is in flight (no loader flicker). */
  showStickyNotCalmWarning: boolean;
  /** Run the title's auto-refresh countdown while we're retrying a not-calm deposit. */
  showNotCalmRefresh: boolean;
};

/**
 * CLM "not calm" deposit auto-refresh. When a deposit quote fails the on-chain calmness check we
 * re-quote every NOT_CALM_REFRESH_SECONDS until a calm quote comes back. The countdown ring AND the
 * re-quote itself are driven by ReloadSpinner (it fires onClick when the countdown completes), so
 * all we need here is the retrying flag — paused while the tab is backgrounded so we don't re-quote
 * the zap api unattended (the countdown re-arms from scratch when the tab is refocused) — plus a
 * sticky flag that keeps the warning from flickering to a loader during the retry's brief Pending.
 * Resets when the user changes what they're transacting.
 */
export function useNotCalmAutoRefresh(): NotCalmAutoRefresh {
  const mode = useAppSelector(selectTransactMode);
  const isWindowFocused = useAppSelector(selectIsWindowFocused);
  const selectionId = useAppSelector(selectTransactSelectedSelectionId);
  const selection = useAppSelector(selectTransactSelected);
  const inputAmounts = useAppSelector(selectTransactInputAmounts);
  const inputMaxes = useAppSelector(selectTransactInputMaxes);
  const chainId = useAppSelector(selectTransactSelectedChainId);
  const status = useAppSelector(selectTransactQuoteStatus);
  const quoteError = useAppSelector(selectTransactQuoteError);

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
    showNotCalmRefresh: retrying && isWindowFocused,
  };
}
