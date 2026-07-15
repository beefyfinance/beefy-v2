import BigNumber from 'bignumber.js';
import { type Address, encodeFunctionData, maxUint256 } from 'viem';
import { PendleRouterAbi } from '../../../../../config/abi/PendleRouterAbi.ts';
import { PendleRouterStaticAbi } from '../../../../../config/abi/PendleRouterStaticAbi.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import { bigNumberToBigInt } from '../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenEntity } from '../../../entities/token.ts';
import { getInsertIndex } from '../../transact/helpers/zap.ts';
import type { ZapStep } from '../../transact/zap/types.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';

/** Canonical Pendle Router V4 address — identical on every chain. */
export const PENDLE_ROUTER_V4 = '0x888888888889758F76e7103c6CbF23ABbF58F946';

/**
 * Pendle Router Static (quoting lens) addresses per chain — from Pendle's
 * official deployments (deployments/<chainId>-core.json). Chain-specific (not a
 * single canonical address) and not discoverable on-chain, so they live here so
 * vault configs don't have to repeat them. A vault config may still override via
 * `routerStaticAddress` (e.g. for a chain not yet listed).
 */
export const PENDLE_ROUTER_STATIC_BY_CHAIN: Partial<Record<ChainEntity['id'], string>> = {
  ethereum: '0x263833d47eA3fA4a30f269323aba6a107f9eB14C',
  arbitrum: '0xAdB09F65bd90d19e3148D9ccb693F3161C6DB3E8',
  base: '0xB4205a645c7e920BD8504181B1D7f2c5C955C3e7',
  optimism: '0x704478Dd72FD7F9B83d1F1e0fc18C14B54F034d0',
  bsc: '0x2700ADB035F82a11899ce1D3f1BF8451c296eABb',
  mantle: '0xCAd502Bb55d1A3F79952F969BFF3f011CF30a94a',
  sonic: '0x0013ACc071f732fd6BF8210AB46A3794a7D8945e',
};

/**
 * Wide default approx params — same as Pendle's `createDefaultApproxParams()`.
 * Lets the on-chain binary search converge for any inserted amount, which is
 * what makes the `insertBalance` patch safe even after an aggregator swap.
 */
const DEFAULT_APPROX_PARAMS = {
  guessMin: 0n,
  guessMax: maxUint256,
  guessOffchain: 0n,
  maxIteration: 256n,
  eps: 10n ** 14n, // 0.01% precision
} as const;

/** Empty SwapData (SwapType.NONE) — we mint SY directly, no external aggregator. */
const EMPTY_SWAP_DATA = {
  swapType: 0,
  extRouter: ZERO_ADDRESS as Address,
  extCalldata: '0x' as const,
  needScale: false,
} as const;

/** Empty LimitOrderData — we never route through Pendle limit orders. */
const EMPTY_LIMIT = {
  limitRouter: ZERO_ADDRESS as Address,
  epsSkipMarket: 0n,
  normalFills: [] as const,
  flashFills: [] as const,
  optData: '0x' as const,
} as const;

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
export class PendleMarket {
  constructor(
    protected readonly marketAddress: string,
    protected readonly routerAddress: string,
    protected readonly routerStaticAddress: string,
    protected readonly chain: ChainEntity
  ) {}

  /** Estimate LP out (in wei) for depositing `amountInWei` of `tokenIn`. */
  public async quoteAddLiquidity(tokenIn: TokenEntity, amountInWei: BigNumber): Promise<BigNumber> {
    const contract = fetchContract(this.routerStaticAddress, PendleRouterStaticAbi, this.chain.id);
    const result = await contract.read.addLiquiditySingleTokenStatic([
      this.marketAddress as Address,
      tokenIn.address as Address,
      bigNumberToBigInt(amountInWei),
    ]);
    // result[0] === netLpOut
    return new BigNumber(result[0].toString(10));
  }

  /** Estimate token out (in wei) for removing `netLpWei` LP to `tokenOut`. */
  public async quoteRemoveLiquidity(
    netLpWei: BigNumber,
    tokenOut: TokenEntity
  ): Promise<BigNumber> {
    const contract = fetchContract(this.routerStaticAddress, PendleRouterStaticAbi, this.chain.id);
    const result = await contract.read.removeLiquiditySingleTokenStatic([
      this.marketAddress as Address,
      bigNumberToBigInt(netLpWei),
      tokenOut.address as Address,
    ]);
    // result[0] === netTokenOut
    return new BigNumber(result[0].toString(10));
  }

  /** Build the `addLiquiditySingleToken` zap step (mint LP from a single token). */
  public buildAddLiquidityZap({
    tokenIn,
    amountInWei,
    minLpOutWei,
    receiver,
    insertBalance,
  }: AddLiquidityZapRequest): ZapStep {
    return {
      target: this.routerAddress,
      value: '0',
      data: encodeFunctionData({
        abi: PendleRouterAbi,
        functionName: 'addLiquiditySingleToken',
        args: [
          receiver as Address,
          this.marketAddress as Address,
          bigNumberToBigInt(minLpOutWei),
          DEFAULT_APPROX_PARAMS,
          {
            tokenIn: tokenIn.address as Address,
            netTokenIn: bigNumberToBigInt(amountInWei),
            // SY mints directly from tokenIn (it is one of the SY's tokensIn)
            tokenMintSy: tokenIn.address as Address,
            pendleSwap: ZERO_ADDRESS as Address,
            swapData: EMPTY_SWAP_DATA,
          },
          EMPTY_LIMIT,
        ],
      }),
      tokens: [
        {
          token: tokenIn.address,
          // netTokenIn is the 12th word (index 11) of the calldata
          index: insertBalance ? getInsertIndex(11) : -1,
        },
      ],
    };
  }

  /** Build the `removeLiquiditySingleToken` zap step (redeem LP to a single token). */
  public buildRemoveLiquidityZap({
    lpAddress,
    netLpWei,
    tokenOut,
    minTokenOutWei,
    receiver,
    insertBalance,
  }: RemoveLiquidityZapRequest): ZapStep {
    return {
      target: this.routerAddress,
      value: '0',
      data: encodeFunctionData({
        abi: PendleRouterAbi,
        functionName: 'removeLiquiditySingleToken',
        args: [
          receiver as Address,
          this.marketAddress as Address,
          bigNumberToBigInt(netLpWei),
          {
            tokenOut: tokenOut.address as Address,
            minTokenOut: bigNumberToBigInt(minTokenOutWei),
            tokenRedeemSy: tokenOut.address as Address,
            pendleSwap: ZERO_ADDRESS as Address,
            swapData: EMPTY_SWAP_DATA,
          },
          EMPTY_LIMIT,
        ],
      }),
      tokens: [
        {
          token: lpAddress,
          // netLpToRemove is the 3rd word (index 2) of the calldata
          index: insertBalance ? getInsertIndex(2) : -1,
        },
      ],
    };
  }
}
