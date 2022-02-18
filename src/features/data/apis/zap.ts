import { pack, keccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';
import { AbiItem } from 'web3-utils';
import { isStandardVault, VaultEntity } from '../entities/vault';
import { BeefyState } from '../../../redux-types';
import { selectVaultById } from '../selectors/vaults';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectTokenById,
} from '../selectors/tokens';
import { getWeb3Instance } from './instances';
import { selectChainById } from '../selectors/chains';
import _zapAbi from '../../../config/abi/zap.json';
import _uniswapV2PairABI from '../../../config/abi/uniswapV2Pair.json';
import _uniswapV2RouterABI from '../../../config/abi/uniswapV2Router.json';
import BigNumber from 'bignumber.js';
import { isTokenErc20, isTokenNative, TokenEntity } from '../entities/token';
import { BIG_ZERO } from '../../../helpers/format';
import { MultiCall } from 'eth-multicall';

// fix ts types
const zapAbi = _zapAbi as AbiItem | AbiItem[];
const uniswapV2PairABI = _uniswapV2PairABI as AbiItem | AbiItem[];
const uniswapV2RouterABI = _uniswapV2RouterABI as AbiItem | AbiItem[];

export interface ZapOptions {
  address: string;
  router: string;
  tokens: TokenEntity[];
}

export async function getEligibleZapOptions(
  state: BeefyState,
  vaultId: VaultEntity['id']
): Promise<ZapOptions | null> {
  const vault = selectVaultById(state, vaultId);
  if (vault.assetIds.length !== 2) {
    return null;
  }

  const wnative = selectChainWrappedNativeToken(state, vault.chainId);
  const native = selectChainNativeToken(state, vault.chainId);
  const _tokenA = selectTokenById(state, vault.chainId, vault.assetIds[0]);
  const _tokenB = selectTokenById(state, vault.chainId, vault.assetIds[1]);
  const tokenA = isTokenNative(_tokenA) ? wnative : _tokenA;
  const tokenB = isTokenNative(_tokenB) ? wnative : _tokenB;

  // we cannot select the addressbook token as the vault token can be an LP token
  const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);

  const zap = state.entities.zaps.byChainId[vault.chainId].find(zap => {
    return (
      isTokenErc20(oracleToken) &&
      oracleToken.contractAddress ===
        computePairAddress(
          zap.ammFactory,
          zap.ammPairInitHash,
          tokenA.contractAddress,
          tokenB.contractAddress
        )
    );
  });
  if (!zap) {
    return null;
  }

  const zapOptions: TokenEntity[] = [tokenA, tokenB];

  if ([tokenA.id, tokenB.id].includes(wnative.id) && ![tokenA.id, tokenB.id].includes(native.id)) {
    zapOptions.unshift(native);
  }
  if ([tokenA.id, tokenB.id].includes(native.id) && ![tokenA.id, tokenB.id].includes(wnative.id)) {
    zapOptions.unshift(wnative);
  }

  return {
    address: zap.zapAddress,
    router: zap.ammRouter,
    tokens: zapOptions,
  };
}

const computePairAddress = (factoryAddress, pairInitHash, tokenA, tokenB) => {
  const [token0, token1] = sortTokens(tokenA, tokenB);
  return getCreate2Address(
    factoryAddress,
    keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
    pairInitHash
  );
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
}
export async function estimateZapDeposit(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  inputTokenId: TokenEntity['id']
): Promise<ZapEstimate> {
  const vault = selectVaultById(state, vaultId);
  const chain = selectChainById(state, vault.chainId);
  const zapOptions = state.ui.deposit.zapOptions;
  const amount = state.ui.deposit.amount;

  const wnative = selectChainWrappedNativeToken(state, vault.chainId);

  const _tokenIn = selectTokenById(state, vault.chainId, inputTokenId);
  const tokenIn = isTokenNative(_tokenIn) ? wnative : _tokenIn;
  const tokenOut =
    tokenIn.id === vault.assetIds[0]
      ? selectTokenById(state, vault.chainId, vault.assetIds[1])
      : tokenIn.id === vault.assetIds[1]
      ? selectTokenById(state, vault.chainId, vault.assetIds[0])
      : tokenIn.id === wnative.id
      ? selectChainNativeToken(state, vault.chainId)
      : selectChainWrappedNativeToken(state, vault.chainId);

  if (amount.isZero()) {
    return {
      tokenIn,
      tokenOut,
      amountIn: BIG_ZERO,
      amountOut: BIG_ZERO,
    };
  }

  const vaultAddress = isStandardVault(vault) ? vault.contractAddress : null;
  const chainTokenAmount = amount.shiftedBy(tokenIn.decimals).decimalPlaces(0);

  const web3 = await getWeb3Instance(chain);
  const contract = new web3.eth.Contract(zapAbi, zapOptions.address);

  const response = await contract.methods
    .estimateSwap(vaultAddress, tokenIn.contractAddress, chainTokenAmount)
    .call();

  return {
    tokenIn,
    tokenOut,
    amountIn: new BigNumber(response.swapAmountIn).shiftedBy(-tokenIn.decimals),
    amountOut: new BigNumber(response.swapAmountOut).shiftedBy(-tokenOut.decimals),
  };
}

export const estimateZapWithdraw = async (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  outputTokenId: TokenEntity['id']
) => {
  const vault = selectVaultById(state, vaultId);
  const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
  const chain = selectChainById(state, vault.chainId);
  const zapOptions = state.ui.withdraw.zapOptions;
  const amount = state.ui.withdraw.amount;

  const wnative = selectChainWrappedNativeToken(state, vault.chainId);

  const _tokenOut = selectTokenById(state, vault.chainId, outputTokenId);
  const tokenOut = isTokenNative(_tokenOut) ? wnative : _tokenOut;
  const _tokenIn =
    tokenOut.id === vault.assetIds[0]
      ? selectTokenById(state, vault.chainId, vault.assetIds[1])
      : tokenOut.id === vault.assetIds[1]
      ? selectTokenById(state, vault.chainId, vault.assetIds[0])
      : tokenOut.id === wnative.id
      ? selectChainNativeToken(state, vault.chainId)
      : selectChainWrappedNativeToken(state, vault.chainId);
  const tokenIn = isTokenNative(_tokenIn) ? wnative : _tokenIn;

  // no zap for native tokens
  if (amount.isZero() || !isTokenErc20(oracleToken)) {
    return {
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: BIG_ZERO,
      amountOut: BIG_ZERO,
    };
  }

  const web3 = await getWeb3Instance(chain);
  const multicall = new MultiCall(web3, chain.multicallAddress);
  const pairContract = new web3.eth.Contract(uniswapV2PairABI, oracleToken.contractAddress);

  const [[pair]] = await multicall.all([
    [
      {
        totalSupply: pairContract.methods.totalSupply(),
        decimals: pairContract.methods.decimals(),
        token0: pairContract.methods.token0(),
        token1: pairContract.methods.token1(),
        reserves: pairContract.methods.getReserves(),
      },
    ],
  ]);

  const reserveIn = tokenIn.contractAddress === pair.token0 ? pair.reserves[0] : pair.reserves[1];
  const reserveOut = tokenOut.contractAddress === pair.token1 ? pair.reserves[1] : pair.reserves[0];

  const rawAmount = amount.shiftedBy(oracleToken.decimals);
  const equity = rawAmount.dividedBy(pair.totalSupply);
  const amountIn = equity.multipliedBy(reserveIn).decimalPlaces(0, BigNumber.ROUND_DOWN);

  const routerContract = new web3.eth.Contract(uniswapV2RouterABI, zapOptions.router);

  const amountOut = new BigNumber(
    await routerContract.methods.getAmountOut(amountIn.toString(10), reserveIn, reserveOut).call()
  );

  return {
    tokenIn,
    tokenOut,
    amountIn: amountIn.shiftedBy(-tokenIn.decimals),
    amountOut: amountOut.shiftedBy(-tokenOut.decimals),
  };
};
