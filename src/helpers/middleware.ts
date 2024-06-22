export function createWalletDebouncer(wait: number) {
  const latestByWallet = new Map<string, AbortController>();

  /**
   * Returns true if the awaiter should abort their operation.
   */
  return async (walletAddress: string, delay: (ms: number) => Promise<void>): Promise<boolean> => {
    const existing = latestByWallet.get(walletAddress);
    if (existing && !existing.signal.aborted) {
      existing.abort();
    }

    const controller = new AbortController();
    latestByWallet.set(walletAddress, controller);
    await delay(wait);
    return controller.signal.aborted;
  };
}
