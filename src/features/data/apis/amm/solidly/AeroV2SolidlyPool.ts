import BigNumber from 'bignumber.js';
import {
  type Abi,
  type Address,
  type Hex,
  encodeAbiParameters,
  encodeFunctionData,
  maxUint256,
  stringToHex,
} from 'viem';
import { AeroV2PoolAbi } from '../../../../../config/abi/AeroV2PoolAbi.ts';
import { bigNumberToBigInt, toWei } from '../../../../../helpers/big-number.ts';
import { slipAllBy, slipBy } from '../../transact/helpers/amounts.ts';
import { onlyOneTokenAmount } from '../../transact/helpers/options.ts';
import { findInsertIndex } from '../../transact/helpers/zap.ts';
import type { ZapStep, ZapStepRequest, ZapStepResponse } from '../../transact/zap/types.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { SwapFeeParams } from '../types.ts';
import { type PairData, SolidlyPool } from './SolidlyPool.ts';

const POOL_TYPE_STABLE = stringToHex('V2_STABLE', { size: 32 });
const POOL_TYPE_VOLATILE = stringToHex('V2_VOLATILE', { size: 32 });

/** Metarouter command ids */
const ADD_LIQUIDITY: Hex = '0x22';
const REMOVE_LIQUIDITY: Hex = '0x23';
/** BalanceSpend.mode for an exact amount pulled from the caller */
const SPEND_MODE_AMOUNT = 0;
/** Amounts that cannot occur in real calldata, used to locate the balance-insert words */
const PLACEHOLDER_AMOUNT_A = maxUint256 - 1n;
const PLACEHOLDER_AMOUNT_B = maxUint256 - 2n;

const MetarouterAbi = [
  {
    type: 'function',
    name: 'execute',
    stateMutability: 'payable',
    inputs: [
      { name: 'commands', type: 'bytes' },
      { name: 'inputs', type: 'bytes[]' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [],
  },
] as const satisfies Abi;

const balanceSpendComponents = [
  { name: 'mode', type: 'uint8' },
  { name: 'value', type: 'uint256' },
] as const;

export const AddLiquidityParamsAbi = [
  {
    type: 'tuple',
    name: 'params',
    components: [
      { name: 'factory', type: 'address' },
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'createPool', type: 'bool' },
      { name: 'spendA', type: 'tuple', components: balanceSpendComponents },
      { name: 'spendB', type: 'tuple', components: balanceSpendComponents },
      { name: 'payerAIsUser', type: 'bool' },
      { name: 'payerBIsUser', type: 'bool' },
      { name: 'amountAMin', type: 'uint256' },
      { name: 'amountBMin', type: 'uint256' },
      { name: 'recipient', type: 'address' },
      { name: 'liquidityMin', type: 'uint256' },
    ],
  },
] as const;

export const RemoveLiquidityParamsAbi = [
  {
    type: 'tuple',
    name: 'params',
    components: [
      { name: 'pool', type: 'address' },
      { name: 'lpSpend', type: 'tuple', components: balanceSpendComponents },
      { name: 'payerIsUser', type: 'bool' },
      { name: 'amount0Min', type: 'uint256' },
      { name: 'amount1Min', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
  },
] as const;

type AeroV2PairData = PairData & {
  factory: string;
};

function encodeExecute(command: Hex, input: Hex, deadline: number): Hex {
  return encodeFunctionData({
    abi: MetarouterAbi,
    functionName: 'execute',
    args: [command, [input], BigInt(deadline)],
  });
}

/**
 * Aerodrome V2 (Superchain) pools: Solidly curves, but no classic router.
 * Liquidity is added/removed through the Metarouter; swaps through the pool are not supported yet.
 */
export class AeroV2SolidlyPool extends SolidlyPool {
  static override readonly supportsPoolSwap = false;
  protected pairData: AeroV2PairData | undefined = undefined;

  protected async updatePairData() {
    const contract = fetchContract(this.address, AeroV2PoolAbi, this.chain.id);
    const [
      totalSupply,
      decimals,
      [decimal0, decimal1, reserves0, reserves1, token0, token1],
      poolType,
      factory,
    ] = await Promise.all([
      contract.read.totalSupply(),
      contract.read.decimals(),
      contract.read.metadata(),
      contract.read.POOL_TYPE(),
      contract.read.factory(),
    ]);

    this.pairData = {
      totalSupply: new BigNumber(totalSupply.toString(10)),
      decimals: decimals,
      token0: token0,
      token1: token1,
      reserves0: new BigNumber(reserves0.toString(10)),
      reserves1: new BigNumber(reserves1.toString(10)),
      decimals0: new BigNumber(decimal0.toString(10)).e!, // 1e18 -> 18
      decimals1: new BigNumber(decimal1.toString(10)).e!,
      stable: this.isStablePoolType(poolType),
      factory: factory,
    };
  }

  protected isStablePoolType(poolType: Hex): boolean {
    const type = poolType.toLowerCase();
    if (type === POOL_TYPE_STABLE) return true;
    if (type === POOL_TYPE_VOLATILE) return false;
    throw new Error(`Unknown Aero V2 pool type ${poolType}`);
  }

  protected getSwapFeeParams(): SwapFeeParams {
    throw new Error('Aero V2 pools do not support swapping through the pool');
  }

  getOptimalSwapAmount(): BigNumber {
    throw new Error('Aero V2 pools do not support swapping through the pool');
  }

  async getZapSwap(): Promise<ZapStepResponse> {
    throw new Error('Aero V2 pools do not support swapping through the pool');
  }

  async getZapAddLiquidity(request: ZapStepRequest): Promise<ZapStepResponse> {
    const pairData = this.pairData;
    if (!pairData) {
      throw new Error('Pair data is not loaded');
    }

    const { inputs, outputs, maxSlippage, zapRouter, insertBalance } = request;

    if (inputs.length !== 2) {
      throw new Error('Invalid inputs');
    }

    for (const input of inputs) {
      if (!this.isTokenInPair(input.token)) {
        throw new Error('Invalid token');
      }
    }

    const output = onlyOneTokenAmount(outputs);
    const minOutputs = slipAllBy(outputs, maxSlippage);
    const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes
    const tokenA = inputs[0].token.address as Address;
    const tokenB = inputs[1].token.address as Address;
    const amountA = bigNumberToBigInt(toWei(inputs[0].amount, inputs[0].token.decimals));
    const amountB = bigNumberToBigInt(toWei(inputs[1].amount, inputs[1].token.decimals));

    const encode = (valueA: bigint, valueB: bigint) =>
      encodeExecute(
        ADD_LIQUIDITY,
        encodeAbiParameters(AddLiquidityParamsAbi, [
          {
            factory: pairData.factory as Address,
            tokenA,
            tokenB,
            createPool: false,
            spendA: { mode: SPEND_MODE_AMOUNT, value: valueA },
            spendB: { mode: SPEND_MODE_AMOUNT, value: valueB },
            payerAIsUser: true,
            payerBIsUser: true,
            amountAMin: bigNumberToBigInt(
              toWei(
                slipBy(inputs[0].amount, maxSlippage, inputs[0].token.decimals),
                inputs[0].token.decimals
              )
            ),
            amountBMin: bigNumberToBigInt(
              toWei(
                slipBy(inputs[1].amount, maxSlippage, inputs[1].token.decimals),
                inputs[1].token.decimals
              )
            ),
            recipient: zapRouter as Address,
            liquidityMin: bigNumberToBigInt(toWei(minOutputs[0].amount, output.token.decimals)),
          },
        ]),
        deadline
      );

    const withPlaceholders = encode(PLACEHOLDER_AMOUNT_A, PLACEHOLDER_AMOUNT_B);
    const step: ZapStep = {
      target: this.amm.routerAddress,
      value: '0',
      data: encode(amountA, amountB),
      tokens: [
        {
          token: tokenA,
          index: insertBalance ? findInsertIndex(withPlaceholders, PLACEHOLDER_AMOUNT_A) : -1,
        },
        {
          token: tokenB,
          index: insertBalance ? findInsertIndex(withPlaceholders, PLACEHOLDER_AMOUNT_B) : -1,
        },
      ],
    };

    return {
      inputs,
      outputs,
      minOutputs,
      returned: [],
      zaps: [step],
    };
  }

  async getZapRemoveLiquidity(request: ZapStepRequest): Promise<ZapStepResponse> {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const { inputs, outputs, maxSlippage, zapRouter, insertBalance } = request;

    const input = onlyOneTokenAmount(inputs);
    if (this.address.toLowerCase() !== input.token.address.toLowerCase()) {
      throw new Error('Invalid input token');
    }

    if (outputs.length !== 2) {
      throw new Error('Invalid output count');
    }

    for (const output of outputs) {
      if (!this.isTokenInPair(output.token)) {
        throw new Error('Invalid output token');
      }
    }

    const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes
    const minOutputs = slipAllBy(outputs, maxSlippage);
    // Metarouter mins are in pool token order, not output order
    const [min0, min1] =
      this.isToken0(minOutputs[0].token.address) ?
        [minOutputs[0], minOutputs[1]]
      : [minOutputs[1], minOutputs[0]];
    const liquidity = bigNumberToBigInt(toWei(input.amount, input.token.decimals));

    const encode = (value: bigint) =>
      encodeExecute(
        REMOVE_LIQUIDITY,
        encodeAbiParameters(RemoveLiquidityParamsAbi, [
          {
            pool: this.address as Address,
            lpSpend: { mode: SPEND_MODE_AMOUNT, value },
            payerIsUser: true,
            amount0Min: bigNumberToBigInt(toWei(min0.amount, min0.token.decimals)),
            amount1Min: bigNumberToBigInt(toWei(min1.amount, min1.token.decimals)),
            recipient: zapRouter as Address,
          },
        ]),
        deadline
      );

    const step: ZapStep = {
      target: this.amm.routerAddress,
      value: '0',
      data: encode(liquidity),
      tokens: [
        {
          token: this.address,
          index:
            insertBalance ?
              findInsertIndex(encode(PLACEHOLDER_AMOUNT_A), PLACEHOLDER_AMOUNT_A)
            : -1,
        },
      ],
    };

    return {
      inputs,
      outputs,
      minOutputs,
      returned: [],
      zaps: [step],
    };
  }
}
