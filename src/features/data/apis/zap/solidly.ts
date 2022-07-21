import { VaultEntity, VaultStandard } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { TokenEntity, TokenErc20 } from '../../entities/token';
import { ZapEstimate, ZapOptions } from './zap-types';
import { getWeb3Instance } from '../instances';
import { MultiCall } from 'eth-multicall';
import { sortTokens, zapAbi } from './helpers';
import _solidlyPairABI from '../../../../config/abi/solidlyPair.json';
import { AbiItem } from 'web3-utils';
import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';
import { BIG_ONE } from '../../../../helpers/big-number';

const solidlyPairABI = _solidlyPairABI as AbiItem | AbiItem[];

export async function estimateZapDepositSolidly(
  zapOptions: ZapOptions,
  vault: VaultStandard,
  chain: ChainEntity,
  amount: BigNumber,
  depositToken: TokenEntity,
  tokenIn: TokenEntity,
  tokenInAddress: TokenEntity['address'],
  tokenInDecimals: TokenEntity['decimals'],
  tokenOut: TokenEntity
): Promise<ZapEstimate> {
  const vaultAddress = vault.earnContractAddress;
  const depositAmount = amount.shiftedBy(tokenIn.decimals).decimalPlaces(0);

  const web3 = await getWeb3Instance(chain);
  const multicall = new MultiCall(web3, chain.multicallAddress);
  const pairContract = new web3.eth.Contract(solidlyPairABI, depositToken.address);
  const zapContract = new web3.eth.Contract(zapAbi, zapOptions.address);

  type MulticallReturnType = [
    [
      {
        metadata: {
          0: string;
          1: string;
          2: string;
          3: string;
          4: boolean;
          5: string;
          6: string;
        };
      }
    ],
    [
      {
        estimate: Record<number, string>;
      }
    ]
  ];

  const [[pair], [zap]]: MulticallReturnType = (await multicall.all([
    [
      {
        metadata: pairContract.methods.metadata(),
      },
    ],
    [
      {
        estimate: zapContract.methods.estimateSwap(
          vaultAddress,
          tokenInAddress,
          depositAmount.toString(10)
        ),
      },
    ],
  ])) as MulticallReturnType;

  if (!zap.estimate || !pair.metadata) {
    throw new Error(`Failed to estimate swap.`);
  }

  // Result of swap estimate
  const [swapAmountIn, swapAmountOut] = Object.values(zap.estimate)
    .slice(0, 2)
    .map(amount => new BigNumber(amount));

  // Calculate price impact
  const { '0': dec0, '1': dec1, '2': r0, '3': r1, '4': isStable, '5': token0 } = pair.metadata;
  const priceImpact = calculatePriceImpact(
    swapAmountIn,
    tokenIn.address,
    new BigNumber(dec0),
    new BigNumber(dec1),
    new BigNumber(r0),
    new BigNumber(r1),
    isStable,
    token0
  );

  return {
    tokenIn,
    tokenOut,
    amountIn: swapAmountIn.shiftedBy(-tokenInDecimals),
    amountOut: swapAmountOut.shiftedBy(-tokenOut.decimals),
    priceImpact,
  };
}

/**
 * @see https://github.com/solidlyexchange/solidly.exchange/blob/b5faba84f64dd7367dc0a63b149c782bea0c3ac0/stores/stableSwapStore.js#L2966-L2976
 * @param amountIn
 * @param tokenIn
 * @param dec0
 * @param dec1
 * @param r0
 * @param r1
 * @param st
 * @param t0
 */
function calculatePriceImpact(
  amountIn: BigNumber,
  tokenIn: string,
  dec0: BigNumber,
  dec1: BigNumber,
  r0: BigNumber,
  r1: BigNumber,
  st: boolean,
  t0: string
): number {
  const sample =
    tokenIn.toLowerCase() === t0.toLowerCase()
      ? r0.multipliedBy(dec1).dividedToIntegerBy(r1)
      : r1.multipliedBy(dec0).dividedToIntegerBy(r0);
  const a = getAmountOut(sample, tokenIn, r0, r1, t0, dec0, dec1, st)
    .shiftedBy(18)
    .dividedToIntegerBy(sample);
  const b = getAmountOut(amountIn, tokenIn, r0, r1, t0, dec0, dec1, st)
    .shiftedBy(18)
    .dividedToIntegerBy(amountIn);

  return BIG_ONE.minus(b.div(a)).times(100).toNumber();
}

function getAmountOut(
  amountIn: BigNumber,
  tokenIn: string,
  reserve0: BigNumber,
  reserve1: BigNumber,
  token0: string,
  decimals0: BigNumber,
  decimals1: BigNumber,
  stable: boolean
): BigNumber {
  const inIsZero = tokenIn.toLowerCase() === token0.toLowerCase();

  if (stable) {
    const xy = getK(reserve0, reserve1, stable, decimals0, decimals1);
    const _reserve0 = reserve0.shiftedBy(18).dividedToIntegerBy(decimals0);
    const _reserve1 = reserve1.shiftedBy(18).dividedToIntegerBy(decimals1);
    const reserveA = inIsZero ? _reserve0 : _reserve1;
    const reserveB = inIsZero ? _reserve1 : _reserve0;
    const _amountIn = inIsZero
      ? amountIn.shiftedBy(18).dividedToIntegerBy(decimals0)
      : amountIn.shiftedBy(18).dividedToIntegerBy(decimals1);
    const y = reserveB.minus(getY(_amountIn.plus(reserveA), xy, reserveB));
    return y.multipliedBy(inIsZero ? decimals1 : decimals0).shiftedBy(-18);
  } else {
    const reserveA = inIsZero ? reserve0 : reserve1;
    const reserveB = inIsZero ? reserve1 : reserve0;

    return amountIn.multipliedBy(reserveB).dividedToIntegerBy(reserveA.plus(amountIn));
  }
}

// x^3*y + y^3*x
// x0*(y*y/1e18*y/1e18)/1e18+(x0*x0/1e18*x0/1e18)*y/1e18
function getF(x0: BigNumber, y: BigNumber): BigNumber {
  // y^3*x
  const a = x0
    .multipliedBy(y.multipliedBy(y).shiftedBy(-18).multipliedBy(y).shiftedBy(-18))
    .shiftedBy(-18);

  // x^3*y
  const b = y
    .multipliedBy(x0.multipliedBy(x0).shiftedBy(-18).multipliedBy(x0).shiftedBy(-18))
    .shiftedBy(-18);

  return a.plus(b);
}

// 3*x0*(y*y/1e18)/1e18+(x0*x0/1e18*x0/1e18)
function getD(x0: BigNumber, y: BigNumber): BigNumber {
  const a = new BigNumber(3)
    .multipliedBy(x0)
    .multipliedBy(y.multipliedBy(y).shiftedBy(-18))
    .shiftedBy(-18);
  const b = x0.multipliedBy(x0).shiftedBy(-18).multipliedBy(x0).shiftedBy(-18);
  return a.plus(b);
}

// Approx x^3*y + y^3*x solved for y
function getY(x0: BigNumber, xy: BigNumber, y: BigNumber): BigNumber {
  for (let i = 0; i < 255; ++i) {
    const y_prev = y;
    const k = getF(x0, y);

    if (k.lt(xy)) {
      const dy = xy.minus(k).shiftedBy(18).dividedToIntegerBy(getD(x0, y));
      y = y.plus(dy);
    } else {
      const dy = k.minus(xy).shiftedBy(18).dividedToIntegerBy(getD(x0, y));
      y = y.minus(dy);
    }

    if (y.gt(y_prev)) {
      if (y.minus(y_prev).lte(BIG_ONE)) {
        return y;
      }
    } else {
      if (y_prev.minus(y).lte(BIG_ONE)) {
        return y;
      }
    }
  }

  return y;
}

function getK(
  x: BigNumber,
  y: BigNumber,
  stable: boolean,
  decimals0: BigNumber,
  decimals1: BigNumber
): BigNumber {
  if (stable) {
    // x^3*y + y^3*x >= k
    // xy(x^2 + y^2) >= k
    const _x = x.shiftedBy(18).dividedToIntegerBy(decimals0);
    const _y = y.shiftedBy(18).dividedToIntegerBy(decimals1);
    const _a = _x.multipliedBy(_y).shiftedBy(-18);
    const _b = _x.multipliedBy(_x).shiftedBy(-18).plus(_y.multipliedBy(_y).shiftedBy(-18));
    return _a.multipliedBy(_b).shiftedBy(-18);
  } else {
    // xy >= k
    return x.multipliedBy(y);
  }
}

export async function estimateZapWithdrawSolidly(
  zapOptions: ZapOptions,
  vault: VaultEntity,
  chain: ChainEntity,
  amount: BigNumber,
  depositToken: TokenErc20,
  tokenIn: TokenEntity,
  tokenOut: TokenEntity,
  tokenOutAddress: TokenEntity['address'],
  tokenOutDecimals: TokenEntity['decimals']
): Promise<ZapEstimate> {
  throw new Error(`Not implemented yet`);
}

export function computeSolidlyPairAddress(
  factoryAddress: string,
  pairInitHash: string,
  tokenA: string,
  tokenB: string,
  isStable: boolean
) {
  const [token0, token1] = sortTokens(tokenA, tokenB);

  try {
    return getCreate2Address(
      factoryAddress,
      keccak256(['bytes'], [pack(['address', 'address', 'bool'], [token0, token1, isStable])]),
      pairInitHash
    );
  } catch (error) {
    // Failing silently causes zap options to not appear rather than deposit/withdraw to not be available at all
    console.error('getCreate2Address failed', {
      error,
      factoryAddress,
      pairInitHash,
      token0,
      token1,
    });
    return null;
  }
}
