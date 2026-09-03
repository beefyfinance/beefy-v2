export function createWalletDebouncer(wait: number) {
  const latestByWallet = new Map<string, AbortController>();

  /**
   * Returns true if the awaiter should abort their operation.
   */
  return async (walletAddress: string, delay: (ms: number) => Promise<void>): Promise<boolean> => {
    // callers supply either the checksummed or the lowercased address for the same wallet
    const key = walletAddress.toLowerCase();
    const existing = latestByWallet.get(key);
    if (existing && !existing.signal.aborted) {
      existing.abort();
    }

    const controller = new AbortController();
    latestByWallet.set(key, controller);
    await delay(wait);
    return controller.signal.aborted;
  };
}
