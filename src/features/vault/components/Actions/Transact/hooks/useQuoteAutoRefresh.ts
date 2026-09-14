import { useEffect, useMemo, useRef, useState } from 'react';
import type { SerializedError } from '../../../../../data/apis/transact/strategies/error-types.ts';
import {
  QuoteCowcentratedNotActionableError,
  QuoteCowcentratedNotCalmError,
} from '../../../../../data/apis/transact/strategies/error.ts';
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

/** actionableAt is an unbounded on-chain uint256; a huge one would overflow setTimeout and fire
 * instantly, re-quoting in a tight loop. Past this we just re-check periodically instead. */
const MAX_COOLDOWN_SECONDS = 600;

export type QuoteRetryAction = 'deposit' | 'withdraw';

export type QuoteRetry = {
  kind: 'not-calm' | 'not-actionable';
  action: QuoteRetryAction;
};

export type QuoteAutoRefresh = {
  /** Retry re-quote in flight — keeps the alert visible (no loader flicker) during its Pending. */
  stickyRetry: QuoteRetry | undefined;
  /** Run the title's auto-refresh countdown while we're retrying. */
  showAutoRefresh: boolean;
  /** How long that countdown runs before it re-quotes. */
  autoRefreshSeconds: number;
};

/**
 * CLM auto-refresh for the two "available again shortly" quote errors: the on-chain calmness check,
 * and the strategy's actionableAt cooldown after a recent tx. Both re-quote on a countdown until a
 * good quote comes back — not-calm every NOT_CALM_REFRESH_SECONDS, not-actionable once the cooldown
 * expires. The countdown ring AND the re-quote itself are driven by ReloadSpinner (it fires onClick
 * when the countdown completes), so all we need here is the retrying flag — paused while the tab is
 * backgrounded so we don't re-quote the zap api unattended (the countdown re-arms with whatever time
 * is left when the tab is refocused) — plus a sticky flag that keeps the alert from flickering to a
 * loader during the retry's brief Pending.
 * Resets when the user changes what they're transacting.
 */
export function useQuoteAutoRefresh(): QuoteAutoRefresh {
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

  // the confirm step re-quotes before sending the tx, so either check can fail there with the
  // quote slice still fulfilled
  const retry =
    quoteRetryOf(quoteError) ??
    (confirmStatus === TransactStatus.Rejected ? quoteRetryOf(confirmError) : undefined);

  // read as primitives so the effects below don't re-run on every render
  const kind = retry?.kind;
  const action = retry?.action;
  const actionableAt = retry?.actionableAt;

  // Set from the first retryable error until any other settled result (good quote, different error,
  // or idle). Persists across the retry's brief Pending so the alert doesn't flicker to a loader.
  const [stickyRetry, setStickyRetry] = useState<QuoteRetry | undefined>();
  useEffect(() => {
    if (kind && action) {
      setStickyRetry({ kind, action });
    } else if (status !== TransactStatus.Pending) {
      setStickyRetry(undefined);
    }
  }, [kind, action, status]);

  // Reset whenever the user changes what they're transacting.
  const skipInitialReset = useRef(true);
  useEffect(() => {
    if (skipInitialReset.current) {
      skipInitialReset.current = false;
      return;
    }
    setStickyRetry(undefined);
  }, [chainId, inputAmounts, mode, selection, selectionId]);

  // The cooldown is an absolute deadline but ReloadSpinner takes a duration, so this has to be the
  // time left *at the moment the countdown arms*. Losing focus tears the countdown down, so recompute
  // on regaining it too — otherwise a tab switch re-arms the original full cooldown all over again.
  const autoRefreshSeconds = useMemo(() => {
    if (
      !isWindowFocused ||
      kind !== 'not-actionable' ||
      actionableAt === undefined ||
      !Number.isFinite(actionableAt)
    ) {
      return NOT_CALM_REFRESH_SECONDS;
    }
    const secondsLeft = actionableAt - Math.floor(Date.now() / 1000);
    return Math.min(MAX_COOLDOWN_SECONDS, Math.max(1, secondsLeft));
  }, [kind, actionableAt, isWindowFocused]);

  return {
    stickyRetry: status === TransactStatus.Pending ? stickyRetry : undefined,
    showAutoRefresh: !!kind && isWindowFocused,
    autoRefreshSeconds,
  };
}

type RetryableError = QuoteRetry & {
  /** unix seconds the vault is actionable again; not-actionable only */
  actionableAt?: number;
};

/** The retry an error maps to, if it's one of the two that clear on their own. */
export function quoteRetryOf(error: SerializedError | undefined): RetryableError | undefined {
  if (!error) {
    return undefined;
  }
  if (QuoteCowcentratedNotCalmError.match(error)) {
    return { kind: 'not-calm', action: error.action };
  }
  if (QuoteCowcentratedNotActionableError.match(error)) {
    return { kind: 'not-actionable', action: error.action, actionableAt: error.actionableAt };
  }
  return undefined;
}
