import BigNumber from 'bignumber.js';
interface PnlTransaction {
    shares: BigNumber;
    price: BigNumber;
    ppfs: BigNumber;
}
export interface PnLBreakdown {
    shares: BigNumber;
    usd: BigNumber;
}
export declare class PnL {
    private state;
    constructor();
    addTransaction(transaction: PnlTransaction): void;
    getUnrealizedPnl(currentPrice: BigNumber, ppfs: BigNumber): PnLBreakdown;
    getRealizedPnl(): PnLBreakdown;
    getRemainingShares(): BigNumber;
    getRemainingSharesAvgEntryPrice(): BigNumber;
    getRemainingSharesAvgEntryPpfs(): BigNumber;
}
interface ClmPnlTransaction {
    shares: BigNumber;
    underlyingToUsd: BigNumber;
    token0ToUsd: BigNumber;
    token1ToUsd: BigNumber;
    underlyingAmount: BigNumber;
    token0Amount: BigNumber;
    token1Amount: BigNumber;
    claims: {
        address: string;
        rewardToUsd: BigNumber;
        claimedAmount: BigNumber;
    }[];
}
export declare class ClmPnl {
    private state;
    constructor();
    addTransaction(transaction: ClmPnlTransaction): void;
    getRemainingShares(): {
        remainingShares: BigNumber;
        remainingUnderlying: BigNumber;
        remainingToken0: BigNumber;
        remainingToken1: BigNumber;
    };
    getRemainingSharesAvgEntryPrice(): {
        token0EntryPrice: BigNumber;
        token1EntryPrice: BigNumber;
    };
    getRealizedPnl(): PnLBreakdown;
    getClaimed(): {
        totalUsd: BigNumber;
        tokens: {
            [address: string]: {
                amount: BigNumber;
                usd: BigNumber;
            };
        };
    };
}
export {};
