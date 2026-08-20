import BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../entities/chain';
import type { TokenEntity } from '../../../entities/token';
import type { ZapStep } from '../../transact/zap/types';
/** Canonical Pendle Router V4 address — identical on every chain. */
export declare const PENDLE_ROUTER_V4 = "0x888888888889758F76e7103c6CbF23ABbF58F946";
/**
 * Pendle Router Static (quoting lens) addresses per chain — from Pendle's
 * official deployments (deployments/<chainId>-core.json). Chain-specific (not a
 * single canonical address) and not discoverable on-chain, so they live here so
 * vault configs don't have to repeat them. A vault config may still override via
 * `routerStaticAddress` (e.g. for a chain not yet listed).
 */
export declare const PENDLE_ROUTER_STATIC_BY_CHAIN: Partial<Record<ChainEntity['id'], string>>;
type AddLiquidityZapRequest = {
    tokenIn: TokenEntity;
    amountInWei: BigNumber;
    minLpOutWei: BigNumber;
    receiver: string;
    insertBalance: boolean;
};
type RemoveLiquidityZapRequest = {
    /** The market / LP token being removed (== vault deposit token) */
    lpAddress: string;
    netLpWei: BigNumber;
    tokenOut: TokenEntity;
    minTokenOutWei: BigNumber;
    receiver: string;
    insertBalance: boolean;
};
/**
 * Helper around a single Pendle market: quotes single-token add/remove liquidity
 * via the Router Static contract and builds the zap calldata for the real router.
 */
export declare class PendleMarket {
    protected readonly marketAddress: string;
    protected readonly routerAddress: string;
    protected readonly routerStaticAddress: string;
    protected readonly chain: ChainEntity;
    constructor(marketAddress: string, routerAddress: string, routerStaticAddress: string, chain: ChainEntity);
    /** Estimate LP out (in wei) for depositing `amountInWei` of `tokenIn`. */
    quoteAddLiquidity(tokenIn: TokenEntity, amountInWei: BigNumber): Promise<BigNumber>;
    /** Estimate token out (in wei) for removing `netLpWei` LP to `tokenOut`. */
    quoteRemoveLiquidity(netLpWei: BigNumber, tokenOut: TokenEntity): Promise<BigNumber>;
    /** Build the `addLiquiditySingleToken` zap step (mint LP from a single token). */
    buildAddLiquidityZap({ tokenIn, amountInWei, minLpOutWei, receiver, insertBalance, }: AddLiquidityZapRequest): ZapStep;
    /** Build the `removeLiquiditySingleToken` zap step (redeem LP to a single token). */
    buildRemoveLiquidityZap({ lpAddress, netLpWei, tokenOut, minTokenOutWei, receiver, insertBalance, }: RemoveLiquidityZapRequest): ZapStep;
}
export {};
