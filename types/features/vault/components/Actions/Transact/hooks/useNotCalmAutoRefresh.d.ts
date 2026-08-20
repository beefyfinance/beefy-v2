export declare const NOT_CALM_REFRESH_SECONDS = 10;
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
export declare function useNotCalmAutoRefresh(): NotCalmAutoRefresh;
