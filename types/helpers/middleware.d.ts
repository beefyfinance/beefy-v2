export declare function createWalletDebouncer(wait: number): (walletAddress: string, delay: (ms: number) => Promise<void>) => Promise<boolean>;
