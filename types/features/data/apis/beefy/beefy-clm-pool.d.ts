import type { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { type TokenEntity } from '../../entities/token';
import type { InputTokenAmount } from '../transact/transact-types';
export declare class BeefyCLMPool {
    protected address: string;
    protected strategy: string;
    protected chain: ChainEntity;
    protected tokens: TokenEntity[];
    readonly type = "uniswap-v2";
    protected readonly PRECISION = 1e+36;
    constructor(address: string, strategy: string, chain: ChainEntity, tokens: TokenEntity[]);
    getDepositRatioData(inputToken: InputTokenAmount, inputTokenPrice: BigNumber, token1Price: BigNumber): Promise<[BigNumber, BigNumber]>;
    /**
     * For dual-token input: determines which token has excess relative to the CLM's deposit ratio
     * and how much of it to swap to the other token.
     *
     * Inputs are in human-readable amounts (not wei).
     */
    getDualInputRebalanceData(inputAmount0: BigNumber, inputAmount1: BigNumber): Promise<{
        swapFromTokenIndex: 0 | 1;
        swapAmount: BigNumber;
        needsSwap: boolean;
    }>;
    private fetchPoolState;
    private convertToBalancingDenomination;
    /**
     * Core deposit-ratio math, independent of I/O and input token.
     * Given an input value already expressed in the balancing token's wei, returns
     * [ratioToToken0, ratioToToken1] that sum to 1.
     *
     * The balancing side has a deficit the input helps fill, so up to `balancingAmount`
     * of the input sticks on that side; any excess is split 50/50.
     */
    private computeRatiosCore;
    previewDeposit(inputAmount0: BigNumber, inputAmount1: BigNumber): Promise<{
        liquidity: BigNumber;
        used0: BigNumber;
        used1: BigNumber;
        position0: BigNumber;
        position1: BigNumber;
        unused0: BigNumber;
        unused1: BigNumber;
        isCalm: boolean;
    }>;
    previewWithdraw(liquidity: BigNumber): Promise<{
        amount0: BigNumber;
        amount1: BigNumber;
        isCalm: boolean;
    }>;
}
