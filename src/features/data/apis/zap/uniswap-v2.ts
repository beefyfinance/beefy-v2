import { VaultEntity, VaultStandard } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { TokenEntity, TokenErc20 } from '../../entities/token';
import { getWeb3Instance } from '../instances';
import { MultiCall } from 'eth-multicall';
import { calculatePriceImpact } from '../../utils/zap-utils';
import { AbiItem } from 'web3-utils';
import { ZapDepositEstimate, ZapOptions, ZapWithdrawEstimate } from './zap-types';
import { sortTokens, zapAbi } from './helpers';
import _uniswapV2PairABI from '../../../../config/abi/uniswapV2Pair.json';
import _uniswapV2RouterABI from '../../../../config/abi/uniswapV2Router.json';
import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';

const uniswapV2PairABI = _uniswapV2PairABI as AbiItem | AbiItem[];
const uniswapV2RouterABI = _uniswapV2RouterABI as AbiItem | AbiItem[];

export async function estimateZapDepositUniswapV2(
  zapOptions: ZapOptions,
  vault: VaultStandard,
  chain: ChainEntity,
  amount: BigNumber,
  depositToken: TokenEntity,
  tokenIn: TokenEntity,
  tokenInAddress: TokenEntity['address'],
  tokenInDecimals: TokenEntity['decimals'],
  tokenOut: TokenEntity
): Promise<ZapDepositEstimate> {
  const vaultAddress = vault.earnContractAddress;
  const depositAmount = amount.shiftedBy(tokenIn.decimals).decimalPlaces(0);

  const web3 = await getWeb3Instance(chain);
  const multicall = new MultiCall(web3, chain.multicallAddress);
  const pairContract = new web3.eth.Contract(uniswapV2PairABI, depositToken.address);
  const zapContract = new web3.eth.Contract(zapAbi, zapOptions.address);

  type MulticallReturnType = [
    [
      {
        reserves: Record<number, string>;
        token0: string;
        token1: string;
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
        token0: pairContract.methods.token0(),
        token1: pairContract.methods.token1(),
        reserves: pairContract.methods.getReserves(),
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

  if (!zap.estimate) {
    throw new Error(`Failed to estimate swap.`);
  }

  // Result of swap estimate
  const [swapAmountIn, swapAmountOut] = Object.values(zap.estimate)
    .slice(0, 2)
    .map(amount => new BigNumber(amount));

  // Calculate price impact
  const { token0 } = pair;
  const [reserves0, reserves1] = Object.values(pair.reserves)
    .slice(0, 2)
    .map(amount => new BigNumber(amount));
  const reserveIn = tokenInAddress.toLowerCase() === token0.toLowerCase() ? reserves0 : reserves1;
  const priceImpact = calculatePriceImpact(swapAmountIn, reserveIn, zapOptions.lpProviderFee);

  // We expect 50% to get swapped
  const amountInRatio = swapAmountIn.dividedBy(depositAmount);
  if (amountInRatio.lt(0.4)) {
    throw new Error(`Not enough liquidity for swap.`);
  }

  return {
    tokenIn,
    tokenOut,
    amountIn: swapAmountIn.shiftedBy(-tokenInDecimals),
    amountOut: swapAmountOut.shiftedBy(-tokenOut.decimals),
    priceImpact,
  };
}

export async function estimateZapWithdrawUniswapV2(
  zapOptions: ZapOptions,
  vault: VaultEntity,
  chain: ChainEntity,
  amount: BigNumber,
  depositToken: TokenErc20,
  tokenIn: TokenEntity,
  tokenOut: TokenEntity,
  tokenOutAddress: TokenEntity['address'],
  tokenOutDecimals: TokenEntity['decimals']
): Promise<ZapWithdrawEstimate> {
  const web3 = await getWeb3Instance(chain);
  const multicall = new MultiCall(web3, chain.multicallAddress);
  const pairContract = new web3.eth.Contract(uniswapV2PairABI, depositToken.address);
  const routerContract = new web3.eth.Contract(uniswapV2RouterABI, zapOptions.router);

  type MulticallReturnType = [
    [
      {
        totalSupply: string;
        decimals: string;
        token0: string;
        token1: string;
        reserves: Record<number, string>;
      }
    ]
  ];

  const [[pair]]: MulticallReturnType = (await multicall.all([
    [
      {
        totalSupply: pairContract.methods.totalSupply(),
        decimals: pairContract.methods.decimals(),
        token0: pairContract.methods.token0(),
        token1: pairContract.methods.token1(),
        reserves: pairContract.methods.getReserves(),
      },
    ],
  ])) as MulticallReturnType;

  const { token0 } = pair;
  const inIsZero = tokenIn.address.toLowerCase() === token0.toLowerCase();
  const [reserves0, reserves1] = Object.values(pair.reserves)
    .slice(0, 2)
    .map(amount => new BigNumber(amount));
  const [reserveIn, reserveOut] = inIsZero ? [reserves0, reserves1] : [reserves1, reserves0];

  // # of LP tokens to withdraw
  const rawAmount = amount.shiftedBy(depositToken.decimals);
  // % of total LP to withdraw
  const equity = rawAmount.dividedBy(pair.totalSupply);
  // if we break LP, how much is token0/1
  const withdrawn0 = equity.multipliedBy(reserves0).decimalPlaces(0, BigNumber.ROUND_DOWN);
  const withdrawn1 = equity.multipliedBy(reserves1).decimalPlaces(0, BigNumber.ROUND_DOWN);
  const withdrawnIn = inIsZero ? withdrawn0 : withdrawn1;
  const withdrawnOut = inIsZero ? withdrawn1 : withdrawn0;

  // We are swapping tokenIn for tokenOut
  const amountIn = withdrawnIn;
  // price impact: swap is AFTER withdraw so lower reserves by amount withdrawn
  const priceImpact = calculatePriceImpact(
    amountIn,
    reserveIn.minus(amountIn),
    zapOptions.lpProviderFee
  );

  // getAmountsOut vs getAmountOut
  let amountOut;
  switch (zapOptions.withdrawEstimateMode) {
    // getAmountOut with static fee param
    case 'getAmountOutWithFee': {
      amountOut = new BigNumber(
        await routerContract.methods
          .getAmountOut(
            amountIn.toString(10),
            reserveIn.toString(10),
            reserveOut.toString(10),
            zapOptions.withdrawEstimateFee
          )
          .call()
      );
      break;
    }
    // getAmountsOut: takes a path
    case 'getAmountsOut': {
      const amountsOut = await routerContract.methods
        .getAmountsOut(amountIn.toString(10), [tokenIn.address, tokenOutAddress])
        .call();
      amountOut = new BigNumber(amountsOut[1]);
      break;
    }
    // getAmountOut: no fee param needed
    default: {
      amountOut = new BigNumber(
        await routerContract.methods
          .getAmountOut(amountIn.toString(10), reserveIn.toString(10), reserveOut.toString(10))
          .call()
      );
      break;
    }
  }

  return {
    tokenIn,
    tokenOut,
    amountIn: amountIn.shiftedBy(-tokenIn.decimals),
    amountOut: amountOut.shiftedBy(-tokenOutDecimals),
    totalOut: amountOut.plus(withdrawnOut).shiftedBy(-tokenOutDecimals),
    priceImpact: priceImpact,
  };
}

export function computeUniswapV2PairAddress(
  factoryAddress: string,
  pairInitHash: string,
  tokenA: string,
  tokenB: string
) {
  const [token0, token1] = sortTokens(tokenA, tokenB);

  try {
    return getCreate2Address(
      factoryAddress,
      keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
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
