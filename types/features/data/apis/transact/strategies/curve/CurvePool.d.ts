import { type CurveTokenOption } from './types';
import type BigNumber from 'bignumber.js';
import type { TokenAmount } from '../../transact-types';
import type { ChainEntity } from '../../../../entities/chain';
import { type TokenEntity } from '../../../../entities/token';
import type { ZapStep } from '../../zap/types';
import { type Abi } from 'viem';
export declare class CurvePool {
    protected readonly option: CurveTokenOption;
    protected readonly poolAddress: string;
    protected readonly chain: ChainEntity;
    protected readonly depositToken: TokenEntity;
    constructor(option: CurveTokenOption, poolAddress: string, chain: ChainEntity, depositToken: TokenEntity);
    /** calc_token_amount */
    quoteAddLiquidity(depositAmount: BigNumber): Promise<TokenAmount>;
    /** calc_token_amount abi */
    protected typeToAddLiquidityQuoteAbi(type: CurveTokenOption['type'], numCoins: number): Abi;
    /** calc_token_amount params */
    protected typeToAddLiquidityQuoteParams(type: CurveTokenOption['type'], poolAddress: string, amounts: bigint[]): unknown[];
    /** add_liquidity */
    buildZapAddLiquidityTx(depositAmountWei: BigNumber, minLiquidityWei: BigNumber, insertBalance: boolean): ZapStep;
    /** add_liquidity indexes */
    protected typeToAddLiquidityTokenIndexes(type: CurveTokenOption['type'], amounts: string[]): number[];
    /** add_liquidity abi */
    protected typeToAddLiquidityAbi(type: CurveTokenOption['type'], numCoins: number): Abi;
    /** add_liquidity params */
    protected typeToAddLiquidityParams(type: CurveTokenOption['type'], poolAddress: string, amounts: string[], minMintAmount: string): unknown[];
    /** calc_withdraw_one_coin */
    quoteRemoveLiquidity(withdrawAmount: BigNumber): Promise<TokenAmount>;
    /** calc_withdraw_one_coin abi */
    protected typeToRemoveLiquidityQuoteAbi(type: CurveTokenOption['type'], numCoins: number): Abi;
    /** calc_withdraw_one_coin params */
    protected typeToRemoveLiquidityQuoteParams(type: CurveTokenOption['type'], poolAddress: string, amount: bigint, tokenIndex: number): unknown[];
    /** remove_liquidity_one_coin */
    buildZapRemoveLiquidityTx(withdrawAmountWei: BigNumber, minOutputWei: BigNumber, insertBalance: boolean): ZapStep;
    /** remove_liquidity_one_coin token indexes */
    protected typeToRemoveLiquidityTokenIndex(type: CurveTokenOption['type']): number;
    /** remove_liquidity_one_coin abi */
    protected typeToRemoveLiquidityAbi(type: CurveTokenOption['type'], numCoins: number): Abi;
    /** remove_liquidity_one_coin params */
    protected typeToRemoveLiquidityParams(type: CurveTokenOption['type'], poolAddress: string, amount: string, tokenIndex: number, minAmount: string): unknown[];
    protected makeAmounts(amount: string, index: number, numCoins: number): string[];
    protected signatureToAbiItem(signature: string, numCoins: number, stateMutability?: 'payable' | 'view'): Abi;
}
