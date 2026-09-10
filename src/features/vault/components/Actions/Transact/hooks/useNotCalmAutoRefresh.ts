import { useEffect, useRef, useState } from 'react';
import type { SerializedError } from '../../../../../data/apis/transact/strategies/error-types.ts';
import { QuoteCowcentratedNotCalmError } from '../../../../../data/apis/transact/strategies/error.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactConfirmError,
  selectTransactConfirmStatus,
  selectTransactInputAmounts,
  selectTransactMode,
  selectTransactQuoteError,
  selectTransactQuoteStatus,
  selectTransactSelectedChainId,
  selectTransactSelectedSelectionIdOrUndefined,
  selectTransactSelectionById,
} from '../../../../../data/selectors/transact.ts';
import { selectIsWindowFocused } from '../../../../../data/selectors/window.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';

export const NOT_CALM_REFRESH_SECONDS = 10;

export type NotCalmAutoRefresh = {
  /** Action of the not-calm retry re-quote in flight — keeps the calm warning visible (no loader flicker). */
  stickyNotCalmAction: 'deposit' | 'withdraw' | undefined;
  /** Run the title's auto-refresh countdown while we're retrying a not-calm quote. */
  showNotCalmRefresh: boolean;
};

/**
 * CLM "not calm" auto-refresh. When a deposit/withdraw quote — or the confirm step's re-quote just
 * before the tx — fails the on-chain calmness check we re-quote every NOT_CALM_REFRESH_SECONDS until
 * a calm quote comes back. The countdown ring AND the re-quote itself are driven by ReloadSpinner
 * (it fires onClick when the countdown completes), so all we need here is the retrying flag — paused
 * while the tab is backgrounded so we don't re-quote the zap api unattended (the countdown re-arms
 * from scratch when the tab is refocused) — plus a sticky flag that keeps the warning from flickering
 * to a loader during the retry's brief Pending.
 * Resets when the user changes what they're transacting.
 */
export function useNotCalmAutoRefresh(): NotCalmAutoRefresh {
  const mode = useAppSelector(selectTransactMode);
  const isWindowFocused = useAppSelector(selectIsWindowFocused);
  // reset-trigger deps only — must not throw before a selection exists (e.g. migrate flow)
  const selectionId = useAppSelector(selectTransactSelectedSelectionIdOrUndefined);
  const selection = useAppSelector(state =>
    selectionId ? selectTransactSelectionById(state, selectionId) : undefined
  );
  const inputAmounts = useAppSelector(selectTransactInputAmounts);
  const chainId = useAppSelector(selectTransactSelectedChainId);
  const status = useAppSelector(selectTransactQuoteStatus);
  const quoteError = useAppSelector(selectTransactQuoteError);
  const confirmStatus = useAppSelector(selectTransactConfirmStatus);
  const confirmError = useAppSelector(selectTransactConfirmError);

  // the confirm step re-quotes before sending the tx, so the calm check can fail there with the
  // quote slice still fulfilled
  const notCalmAction =
    notCalmActionOf(quoteError) ??
    (confirmStatus === TransactStatus.Rejected ? notCalmActionOf(confirmError) : undefined);

  // Set from the first not-calm error until any other settled result (calm quote, different error,
  // or idle). Persists across the retry's brief Pending so the warning doesn't flicker to a loader.
  const [retryingAction, setRetryingAction] = useState<'deposit' | 'withdraw' | undefined>();
  useEffect(() => {
    if (notCalmAction) {
      setRetryingAction(notCalmAction);
    } else if (status !== TransactStatus.Pending) {
      setRetryingAction(undefined);
    }
  }, [notCalmAction, status]);

  // Reset whenever the user changes what they're transacting. Not keyed on the max flags: toggling
  // max alone doesn't re-quote (transactFetchQuotesIfNeeded compares amounts), so resetting on it
  // would strand the warning with a dead countdown.
  const skipInitialReset = useRef(true);
  useEffect(() => {
    if (skipInitialReset.current) {
      skipInitialReset.current = false;
      return;
    }
    setRetryingAction(undefined);
  }, [chainId, inputAmounts, mode, selection, selectionId]);

  return {
    stickyNotCalmAction: status === TransactStatus.Pending ? retryingAction : undefined,
    // pause the countdown while a re-quote is in flight so a slow quote isn't discarded by the next tick
    showNotCalmRefresh: !!retryingAction && isWindowFocused && status !== TransactStatus.Pending,
  };
}

function notCalmActionOf(error: SerializedError | undefined) {
  return error && QuoteCowcentratedNotCalmError.match(error) ? error.action : undefined;
}
