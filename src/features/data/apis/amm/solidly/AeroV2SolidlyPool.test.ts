import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { decodeAbiParameters, decodeFunctionData, parseAbi } from 'viem';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { AmmEntitySolidly } from '../../../entities/zap.ts';
import {
  baseUsdc,
  baseWeth,
  bn,
  erc20Token,
} from '../../transact/helpers/same-balance.test-helper.ts';
import {
  AddLiquidityParamsAbi,
  AeroV2SolidlyPool,
  RemoveLiquidityParamsAbi,
} from './AeroV2SolidlyPool.ts';

const METAROUTER = '0x0fef9e88a7b76bcdbf451780c6774fe32965ee98';
const FACTORY = '0x8e6a9fcd1d638cc760ffba397605fe3355de76d2';
const ZAP_ROUTER = '0x000000000000000000000000000000000000beef';
const LP_ADDRESS = '0x0b09f2f7b096016b797943807558fa38119edc8c';
const executeAbi = parseAbi(['function execute(bytes commands, bytes[] inputs, uint256 deadline)']);

const amm = {
  id: 'base-aero-v2',
  type: 'solidly',
  routerAddress: METAROUTER,
} as AmmEntitySolidly;
const chain = { id: 'base' } as ChainEntity;
const lp = erc20Token('base', 'WETH-USDC', 'vAMMV2-WETH/USDC', LP_ADDRESS, 18);

class TestPool extends AeroV2SolidlyPool {
  constructor() {
    super(LP_ADDRESS, amm, chain);
    this.pairData = {
      totalSupply: bn('1000000000000000000000'),
      decimals: 18,
      token0: baseWeth.address,
      token1: baseUsdc.address,
      reserves0: bn('100000000000000000000'),
      reserves1: bn('300000000000'),
      decimals0: 18,
      decimals1: 6,
      stable: false,
      factory: FACTORY,
    };
  }
}

function decodeExecute(data: string) {
  const { args } = decodeFunctionData({ abi: executeAbi, data: data as `0x${string}` });
  return { commands: args[0], inputs: args[1], deadline: args[2] };
}

/** mimics BeefyZapRouter overwriting one 32-byte word with the live balance */
function overwriteWord(data: string, index: number, value: bigint): string {
  const start = 2 + index * 2;
  return data.slice(0, start) + value.toString(16).padStart(64, '0') + data.slice(start + 64);
}

describe('AeroV2SolidlyPool add liquidity step', () => {
  const request = {
    // inputs are given in the reverse of pool order to check A/B are kept as given
    inputs: [
      { token: baseUsdc, amount: bn('3000') },
      { token: baseWeth, amount: bn('1') },
    ],
    outputs: [{ token: lp, amount: bn('10') }],
    maxSlippage: 0.01,
    zapRouter: ZAP_ROUTER,
    insertBalance: true,
  };

  it('encodes a single Metarouter ADD_LIQUIDITY command paid by the zap router', async () => {
    const response = await new TestPool().getZapAddLiquidity(request);

    expect(response.zaps).toHaveLength(1);
    const step = response.zaps[0];
    expect(step.target).toBe(METAROUTER);
    expect(step.value).toBe('0');

    const { commands, inputs } = decodeExecute(step.data);
    expect(commands).toBe('0x22');
    expect(inputs).toHaveLength(1);
    const [params] = decodeAbiParameters(AddLiquidityParamsAbi, inputs[0]);
    expect(params.factory.toLowerCase()).toBe(FACTORY);
    expect(params.tokenA.toLowerCase()).toBe(baseUsdc.address.toLowerCase());
    expect(params.tokenB.toLowerCase()).toBe(baseWeth.address.toLowerCase());
    expect(params.createPool).toBe(false);
    expect(params.spendA).toEqual({ mode: 0, value: 3000_000000n });
    expect(params.spendB).toEqual({ mode: 0, value: 1_000000000000000000n });
    expect(params.payerAIsUser).toBe(true);
    expect(params.payerBIsUser).toBe(true);
    expect(params.amountAMin).toBe(2970_000000n);
    expect(params.amountBMin).toBe(990000000000000000n);
    expect(params.recipient.toLowerCase()).toBe(ZAP_ROUTER);
    expect(params.liquidityMin).toBe(9_900000000000000000n);
  });

  it('points the balance inserts at the spend amounts and nothing else', async () => {
    const response = await new TestPool().getZapAddLiquidity(request);
    const step = response.zaps[0];
    expect(step.tokens.map(t => t.token.toLowerCase())).toEqual([
      baseUsdc.address.toLowerCase(),
      baseWeth.address.toLowerCase(),
    ]);

    const before = decodeAbiParameters(
      AddLiquidityParamsAbi,
      decodeExecute(step.data).inputs[0]
    )[0];
    let data = step.data;
    data = overwriteWord(data, step.tokens[0].index, 3100_000000n);
    data = overwriteWord(data, step.tokens[1].index, 1_100000000000000000n);
    const after = decodeAbiParameters(AddLiquidityParamsAbi, decodeExecute(data).inputs[0])[0];

    expect(after).toEqual({
      ...before,
      spendA: { mode: 0, value: 3100_000000n },
      spendB: { mode: 0, value: 1_100000000000000000n },
    });
  });

  it('does not insert balances when not requested', async () => {
    const response = await new TestPool().getZapAddLiquidity({ ...request, insertBalance: false });
    expect(response.zaps[0].tokens.map(t => t.index)).toEqual([-1, -1]);
  });
});

describe('AeroV2SolidlyPool remove liquidity step', () => {
  const request = {
    inputs: [{ token: lp, amount: bn('10') }],
    // outputs in reverse pool order to check mins are reordered to token0/token1
    outputs: [
      { token: baseUsdc, amount: bn('3000') },
      { token: baseWeth, amount: bn('1') },
    ],
    maxSlippage: 0.01,
    zapRouter: ZAP_ROUTER,
    insertBalance: true,
  };

  it('encodes a single Metarouter REMOVE_LIQUIDITY command with mins in pool order', async () => {
    const response = await new TestPool().getZapRemoveLiquidity(request);

    expect(response.zaps).toHaveLength(1);
    const step = response.zaps[0];
    expect(step.target).toBe(METAROUTER);

    const { commands, inputs } = decodeExecute(step.data);
    expect(commands).toBe('0x23');
    const [params] = decodeAbiParameters(RemoveLiquidityParamsAbi, inputs[0]);
    expect(params.pool.toLowerCase()).toBe(LP_ADDRESS);
    expect(params.lpSpend).toEqual({ mode: 0, value: 10_000000000000000000n });
    expect(params.payerIsUser).toBe(true);
    expect(params.amount0Min).toBe(990000000000000000n); // WETH is token0
    expect(params.amount1Min).toBe(2970_000000n); // USDC is token1
    expect(params.recipient.toLowerCase()).toBe(ZAP_ROUTER);
    expect(response.minOutputs.map(o => o.token)).toEqual([baseUsdc, baseWeth]);
  });

  it('points the balance insert at the lp amount and nothing else', async () => {
    const response = await new TestPool().getZapRemoveLiquidity(request);
    const step = response.zaps[0];
    expect(step.tokens).toHaveLength(1);
    expect(step.tokens[0].token.toLowerCase()).toBe(LP_ADDRESS);

    const before = decodeAbiParameters(
      RemoveLiquidityParamsAbi,
      decodeExecute(step.data).inputs[0]
    )[0];
    const data = overwriteWord(step.data, step.tokens[0].index, 11_000000000000000000n);
    const after = decodeAbiParameters(RemoveLiquidityParamsAbi, decodeExecute(data).inputs[0])[0];

    expect(after).toEqual({ ...before, lpSpend: { mode: 0, value: 11_000000000000000000n } });
  });
});

describe('AeroV2SolidlyPool pool swaps', () => {
  it('reports no pool swap support and refuses to quote or build one', async () => {
    const pool = new TestPool();
    expect(pool.supportsPoolSwap()).toBe(false);
    expect(() => pool.getOptimalSwapAmount()).toThrow(/not support swapping/);
    expect(() => pool.swap(new BigNumber(1), baseWeth.address)).toThrow(/not support swapping/);
    await expect(pool.getZapSwap()).rejects.toThrow(/not support swapping/);
  });
});
