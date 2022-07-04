import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';
import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import _uniswapV2PairABI from '../../../config/abi/uniswapV2Pair.json';
import _uniswapV2RouterABI from '../../../config/abi/uniswapV2Router.json';
import _zapAbi from '../../../config/abi/zap.json';
import { BeefyState } from '../../../redux-types';
import {
  isTokenErc20,
  isTokenNative,
  TokenEntity,
  TokenErc20,
  TokenNative,
} from '../entities/token';
import { isStandardVault, VaultEntity } from '../entities/vault';
import { selectChainById } from '../selectors/chains';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectIsTokenLoaded,
  selectTokenByAddress,
  selectTokenById,
} from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';
import { calculatePriceImpact, getZapAddress, getZapDecimals } from '../utils/zap-utils';
import { getWeb3Instance } from './instances';
import { BIG_ZERO } from '../../../helpers/big-number';
import { ZapConfig } from './config-types';

// fix ts types
const zapAbi = _zapAbi as AbiItem | AbiItem[];
const uniswapV2PairABI = _uniswapV2PairABI as AbiItem | AbiItem[];
const uniswapV2RouterABI = _uniswapV2RouterABI as AbiItem | AbiItem[];

export interface ZapOptions {
  address: string;
  router: string;
  tokens: TokenEntity[];
  withdrawEstimateMode: ZapConfig['withdrawEstimateMode'];
  lpProviderFee: ZapConfig['lpProviderFee'];
}

const zapOptionsCache: { [vaultId: VaultEntity['id']]: ZapOptions | null } = {};

export function getEligibleZapOptions(
  state: BeefyState,
  vaultId: VaultEntity['id']
): ZapOptions | null {
  if (zapOptionsCache[vaultId] !== undefined) {
    return zapOptionsCache[vaultId];
  }

  const vault = selectVaultById(state, vaultId);
  if (vault.assetIds.length !== 2) {
    zapOptionsCache[vaultId] = null;
    return null;
  }
  // sometimes, the addressbook does not yet contains the necessary token address
  if (
    !selectIsTokenLoaded(state, vault.chainId, vault.assetIds[0]) ||
    !selectIsTokenLoaded(state, vault.chainId, vault.assetIds[1])
  ) {
    console.warn(
      `Could not estimate zap due to missing token info for vault ${vaultId}. Maybe you need to add this vault's tokens to the beefy addressbook`
    );
    return null;
  }

  const wnative = selectChainWrappedNativeToken(state, vault.chainId);
  const native = selectChainNativeToken(state, vault.chainId);

  const tokenA = selectTokenById(state, vault.chainId, vault.assetIds[0]);
  const tokenB = selectTokenById(state, vault.chainId, vault.assetIds[1]);

  // we cannot select the addressbook token as the vault token can be an LP token
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

  const zap = state.entities.zaps.byChainId[vault.chainId].find(zap => {
    return (
      isTokenErc20(depositToken) &&
      depositToken.address ===
        computePairAddress(
          zap.ammFactory,
          zap.ammPairInitHash,
          getZapAddress(tokenA, wnative),
          getZapAddress(tokenB, wnative)
        )
    );
  });
  if (!zap) {
    zapOptionsCache[vaultId] = null;
    return null;
  }

  const zapTokens: TokenEntity[] = [tokenA, tokenB];

  if ([tokenA.id, tokenB.id].includes(wnative.id) && ![tokenA.id, tokenB.id].includes(native.id)) {
    zapTokens.unshift(native);
  }
  if ([tokenA.id, tokenB.id].includes(native.id) && ![tokenA.id, tokenB.id].includes(wnative.id)) {
    zapTokens.unshift(wnative);
  }

  const zapOptions = {
    address: zap.zapAddress,
    router: zap.ammRouter,
    tokens: zapTokens,
    withdrawEstimateMode: zap.withdrawEstimateMode || 'getAmountOut',
    lpProviderFee: zap.lpProviderFee || 0,
  };
  zapOptionsCache[vaultId] = zapOptions;
  return zapOptions;
}

const computePairAddress = (factoryAddress, pairInitHash, tokenA, tokenB) => {
  const [token0, token1] = sortTokens(tokenA, tokenB);

  try {
    return getCreate2Address(
      factoryAddress,
      keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
      pairInitHash
    );
  } catch (error) {
    console.error('getCreate2Address failed', {
      error,
      factoryAddress,
      pairInitHash,
      token0,
      token1,
    });
    return null;
  }
};

const sortTokens = (tokenA, tokenB) => {
  if (tokenA === tokenB)
    throw new RangeError(`Zap: tokenA should not be equal to tokenB: ${tokenB}`);
  return tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
};

export interface ZapEstimate {
  tokenIn: TokenEntity;
  tokenOut: TokenEntity;
  amountIn: BigNumber;
  amountOut: BigNumber;
  priceImpact: number;
}

function getOppositeToken(
  state: BeefyState,
  token: TokenEntity,
  vault: VaultEntity,
  wnative: TokenErc20,
  native: TokenNative
) {
  // Return token for assets[1] if input is assets[0]
  if (
    token.id === vault.assetIds[0] ||
    (token.id === wnative.id && native.id === vault.assetIds[0])
  ) {
    return selectTokenById(state, vault.chainId, vault.assetIds[1]);
  }

  // Return token for assets[0] if input is assets[1]
  if (
    token.id === vault.assetIds[1] ||
    (token.id === wnative.id && native.id === vault.assetIds[1])
  ) {
    return selectTokenById(state, vault.chainId, vault.assetIds[0]);
  }

  // Return native token if input is wrapped native???
  if (token.id === wnative.id) {
    return selectChainNativeToken(state, vault.chainId);
  }

  // Otherwise return wrapped native???
  return selectChainWrappedNativeToken(state, vault.chainId);
}

export async function estimateZapDeposit(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  inputTokenId: TokenEntity['id']
): Promise<ZapEstimate> {
  const vault = selectVaultById(state, vaultId);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const chain = selectChainById(state, vault.chainId);
  const zapOptions = state.ui.deposit.zapOptions;
  const amount = state.ui.deposit.amount;

  const wnative = selectChainWrappedNativeToken(state, vault.chainId);
  const native = selectChainNativeToken(state, vault.chainId);

  const tokenIn = selectTokenById(state, vault.chainId, inputTokenId);
  const tokenInAddress = getZapAddress(tokenIn, wnative);
  const tokenInDecimals = getZapDecimals(tokenIn, wnative);
  const tokenOut = getOppositeToken(state, tokenIn, vault, wnative, native);

  // can not zap in 0
  if (amount.isZero()) {
    return {
      tokenIn,
      tokenOut,
      amountIn: BIG_ZERO,
      amountOut: BIG_ZERO,
      priceImpact: 0,
    };
  }

  const vaultAddress = isStandardVault(vault) ? vault.earnContractAddress : null;
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

  const { token0 } = pair;
  const [reserves0, reserves1] = Object.values(pair.reserves)
    .slice(0, 2)
    .map(amount => new BigNumber(amount));
  const reserveIn = tokenIn.address.toLowerCase() === token0.toLowerCase() ? reserves0 : reserves1;
  const [swapAmountIn, swapAmountOut] = Object.values(zap.estimate)
    .slice(0, 2)
    .map(amount => new BigNumber(amount));

  const amountIn = new BigNumber(zap.estimate[0]);
  const priceImpact = calculatePriceImpact(amountIn, reserveIn, zapOptions.lpProviderFee);

  return {
    tokenIn,
    tokenOut,
    amountIn: swapAmountIn.shiftedBy(-tokenInDecimals),
    amountOut: swapAmountOut.shiftedBy(-tokenOut.decimals),
    priceImpact,
  };
}

export const estimateZapWithdraw = async (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  outputTokenId: TokenEntity['id']
) => {
  const vault = selectVaultById(state, vaultId);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const chain = selectChainById(state, vault.chainId);
  const zapOptions = state.ui.withdraw.zapOptions;
  const amount = state.ui.withdraw.amount;

  const wnative = selectChainWrappedNativeToken(state, vault.chainId);
  const native = selectChainNativeToken(state, vault.chainId);

  const tokenOut = selectTokenById(state, vault.chainId, outputTokenId);
  const tokenOutAddress = getZapAddress(tokenOut, wnative);
  const tokenOutDecimals = getZapDecimals(tokenOut, wnative);
  const _tokenIn = getOppositeToken(state, tokenOut, vault, wnative, native);
  const tokenIn = isTokenNative(_tokenIn) ? wnative : _tokenIn;

  // no zap for native tokens
  if (amount.isZero() || !isTokenErc20(depositToken)) {
    return {
      tokenIn,
      tokenOut,
      amountIn: BIG_ZERO,
      amountOut: BIG_ZERO,
      priceImpact: 0,
    };
  }

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
  const [reserves0, reserves1] = Object.values(pair.reserves)
    .slice(0, 2)
    .map(amount => new BigNumber(amount));
  const [reserveIn, reserveOut] =
    tokenIn.address.toLowerCase() === token0.toLowerCase()
      ? [reserves0, reserves1]
      : [reserves1, reserves0];

  const rawAmount = amount.shiftedBy(depositToken.decimals); // # of LP tokens to withdraw
  const equity = rawAmount.dividedBy(pair.totalSupply); // % of total LP to withdraw
  const amountIn = equity.multipliedBy(reserveIn).decimalPlaces(0, BigNumber.ROUND_DOWN); // if we break LP, how much is tokenIn
  const priceImpact = calculatePriceImpact(amountIn, reserveIn, zapOptions.lpProviderFee);

  // getAmountsOut vs getAmountOut
  let amountOut;
  if (zapOptions.withdrawEstimateMode === 'getAmountsOut') {
    const amountsOut = await routerContract.methods
      .getAmountsOut(amountIn.toString(10), [tokenIn.address, tokenOutAddress])
      .call();
    amountOut = new BigNumber(amountsOut[1]);
  } else {
    amountOut = new BigNumber(
      await routerContract.methods.getAmountOut(amountIn.toString(10), reserveIn, reserveOut).call()
    );
  }

  return {
    tokenIn,
    tokenOut,
    amountIn: amountIn.shiftedBy(-tokenIn.decimals),
    amountOut: amountOut.shiftedBy(-tokenOutDecimals),
    priceImpact: priceImpact,
  };
};
