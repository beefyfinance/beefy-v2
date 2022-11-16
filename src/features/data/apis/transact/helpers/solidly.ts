import BigNumber from 'bignumber.js';
import { BIG_ONE } from '../../../../../helpers/big-number';
import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';
import { sortTokenAddresses } from './tokens';

enum MetadataKeys {
  decimals0,
  decimals1,
  reserves0,
  reserves1,
  stable,
  token0,
  token1,
}

export type MetadataRaw = {
  0: string; // decimals0 (1e18 not 18)
  1: string; // decimals1
  2: string; // reserves0
  3: string; // reserves1
  4: boolean; // stable
  5: string; // token0
  6: string; // token1
};

export type Metadata = {
  decimals0: BigNumber;
  decimals1: BigNumber;
  reserves0: BigNumber;
  reserves1: BigNumber;
  stable: boolean;
  token0: string;
  token1: string;
};

export function metadataToObject(raw: MetadataRaw): Metadata {
  return {
    decimals0: new BigNumber(raw[MetadataKeys.decimals0]),
    decimals1: new BigNumber(raw[MetadataKeys.decimals1]),
    reserves0: new BigNumber(raw[MetadataKeys.reserves0]),
    reserves1: new BigNumber(raw[MetadataKeys.reserves1]),
    stable: raw[MetadataKeys.stable],
    token0: raw[MetadataKeys.token0],
    token1: raw[MetadataKeys.token1],
  };
}

export type NormalizedReserves = {
  reservesIn: BigNumber;
  reservesOut: BigNumber;
  decimalsIn: BigNumber;
  decimalsOut: BigNumber;
};

function getNormalizedReserves(tokenIn: string, metadata: Metadata): NormalizedReserves {
  const inIsZero = tokenIn.toLowerCase() === metadata.token0.toLowerCase();

  const reservesIn = inIsZero ? metadata.reserves0 : metadata.reserves1;
  const reservesOut = inIsZero ? metadata.reserves1 : metadata.reserves0;
  const decimalsIn = inIsZero ? metadata.decimals0 : metadata.decimals1;
  const decimalsOut = inIsZero ? metadata.decimals1 : metadata.decimals0;

  return {
    reservesIn: reservesIn.shiftedBy(18).dividedToIntegerBy(decimalsIn),
    reservesOut: reservesOut.shiftedBy(18).dividedToIntegerBy(decimalsOut),
    decimalsIn,
    decimalsOut,
  };
}

export function calculatePriceImpact(
  amountIn: BigNumber,
  tokenIn: string,
  metadata: Metadata
): number {
  const reserves = getNormalizedReserves(tokenIn, metadata);

  const priceWithoutImpact = getPrice(
    reserves.reservesIn.shiftedBy(-18),
    reserves.reservesOut.shiftedBy(-18),
    metadata.stable
  ).times(amountIn.div(reserves.decimalsIn));

  const priceAfterSwap = getAmountOut(
    amountIn.div(reserves.decimalsIn),
    reserves.reservesIn.shiftedBy(-18),
    reserves.reservesOut.shiftedBy(-18),
    metadata.stable
  );

  const priceImpact = BIG_ONE.minus(priceAfterSwap.div(priceWithoutImpact));
  return priceImpact.toNumber();
}

export type SwapResult = {
  amountOut: BigNumber;
  priceImpact: null;
};
export function calculateSwap(amountIn: BigNumber, tokenIn: string, metadata: Metadata) {
  const reserves = getNormalizedReserves(tokenIn, metadata);

  const priceWithoutImpact = getPrice(
    reserves.reservesIn.shiftedBy(-18),
    reserves.reservesOut.shiftedBy(-18),
    metadata.stable
  ).times(amountIn.div(reserves.decimalsIn));

  const priceAfterSwap = getAmountOut(
    amountIn.div(reserves.decimalsIn),
    reserves.reservesIn.shiftedBy(-18),
    reserves.reservesOut.shiftedBy(-18),
    metadata.stable
  );

  const priceImpact = BIG_ONE.minus(priceAfterSwap.div(priceWithoutImpact));

  return {
    amountOut: priceAfterSwap.times(reserves.decimalsOut).decimalPlaces(0),
    priceImpact: priceImpact.toNumber(),
  };
}

function getPrice(reserveIn: BigNumber, reserveOut: BigNumber, stable): BigNumber {
  const minimalValue = BIG_ONE.shiftedBy(-9);
  if (stable) {
    return getAmountOutStable(minimalValue, reserveIn, reserveOut).div(minimalValue);
  } else {
    return getAmountOutVolatile(minimalValue, reserveIn, reserveOut).div(minimalValue);
  }
}

function getAmountOut(
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber,
  stable: boolean
): BigNumber {
  if (stable) {
    return getAmountOutStable(amountIn, reserveIn, reserveOut);
  } else {
    return getAmountOutVolatile(amountIn, reserveIn, reserveOut);
  }
}

function getAmountOutVolatile(
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber
): BigNumber {
  return amountIn.times(reserveOut).div(reserveIn.plus(amountIn));
}

function getAmountOutStable(
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber
): BigNumber {
  const xy = _k(reserveIn, reserveOut);
  return reserveOut.minus(_getY(amountIn.plus(reserveIn), xy, reserveOut));
}

function _k(_x: BigNumber, _y: BigNumber): BigNumber {
  const _a = _x.times(_y);
  const _b = _x.times(_x).plus(_y.times(_y));
  // x3y+y3x >= k
  return _a.times(_b);
}

function _getY(x0: BigNumber, xy: BigNumber, y: BigNumber): BigNumber {
  for (let i = 0; i < 255; i++) {
    const yPrev = y;
    const k = _f(x0, y);
    if (k.lt(xy)) {
      const dy = xy.minus(k).div(_d(x0, y));
      y = y.plus(dy);
    } else {
      const dy = k.minus(xy).div(_d(x0, y));
      y = y.minus(dy);
    }
    if (_closeTo(y, yPrev, 1)) {
      break;
    }
  }
  return y;
}

function _f(x0: BigNumber, y: BigNumber): BigNumber {
  return x0.times(y.pow(3)).plus(y.times(x0.pow(3)));
}

function _d(x0: BigNumber, y: BigNumber): BigNumber {
  return new BigNumber(3).times(x0.times(y.pow(2))).plus(x0.pow(3));
}

function _closeTo(a: BigNumber, b: BigNumber, target: number): boolean {
  if (a.gt(b)) {
    if (a.minus(b).lt(target)) {
      return true;
    }
  } else {
    if (b.minus(a).lt(target)) {
      return true;
    }
  }
  return false;
}

export function computeSolidlyPairAddress(
  factoryAddress: string,
  pairInitHash: string,
  tokenA: string,
  tokenB: string,
  isStable: boolean
) {
  const [token0, token1] = sortTokenAddresses([tokenA, tokenB]);

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

export function isStablePair(
  factoryAddress: string,
  pairInitHash: string,
  tokenA: string,
  tokenB: string,
  tokenLP: string
): boolean {
  return (
    computeSolidlyPairAddress(
      factoryAddress,
      pairInitHash,
      tokenA.toLowerCase(),
      tokenB.toLowerCase(),
      true
    ).toLowerCase() === tokenLP.toLowerCase()
  );
}
