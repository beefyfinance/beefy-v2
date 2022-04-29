import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';
import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import _uniswapV2PairABI from '../../../config/abi/uniswapV2Pair.json';
import _uniswapV2RouterABI from '../../../config/abi/uniswapV2Router.json';
import _zapAbi from '../../../config/abi/zap.json';
import { BIG_ZERO } from '../../../helpers/format';
import { BeefyState } from '../../../redux-types';
import { isTokenErc20, isTokenNative, TokenEntity } from '../entities/token';
import { isStandardVault, VaultEntity } from '../entities/vault';
import { selectChainById } from '../selectors/chains';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectIsTokenLoaded,
  selectTokenById,
} from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';
import { getZapAddress, getZapDecimals } from '../utils/zap-utils';
import { getWeb3Instance } from './instances';

// fix ts types
const zapAbi = _zapAbi as AbiItem | AbiItem[];
const uniswapV2PairABI = _uniswapV2PairABI as AbiItem | AbiItem[];
const uniswapV2RouterABI = _uniswapV2RouterABI as AbiItem | AbiItem[];

export interface ZapOptions {
  address: string;
  router: string;
  tokens: TokenEntity[];
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
  const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);

  const zap = state.entities.zaps.byChainId[vault.chainId].find(zap => {
    return (
      isTokenErc20(oracleToken) &&
      oracleToken.address ===
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
  };
  zapOptionsCache[vaultId] = zapOptions;
  return zapOptions;
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
  const native = selectChainNativeToken(state, vault.chainId);

  const tokenIn = selectTokenById(state, vault.chainId, inputTokenId);
  const tokenInContract = getZapAddress(tokenIn, wnative);
  const tokenInDecimals = getZapDecimals(tokenIn, wnative);

  const tokenOut =
    tokenIn.id === vault.assetIds[0] ||
    (tokenIn.id === wnative.id && native.id === vault.assetIds[0])
      ? selectTokenById(state, vault.chainId, vault.assetIds[1])
      : tokenIn.id === vault.assetIds[1] ||
        (tokenIn.id === wnative.id && native.id === vault.assetIds[1])
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
    .estimateSwap(vaultAddress, tokenInContract, chainTokenAmount.toString(10))
    .call();

  return {
    tokenIn,
    tokenOut,
    amountIn: new BigNumber(response.swapAmountIn).shiftedBy(-tokenInDecimals),
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
  const native = selectChainNativeToken(state, vault.chainId);

  const tokenOut = selectTokenById(state, vault.chainId, outputTokenId);
  const tokenOutAddress = getZapAddress(tokenOut, wnative);
  const tokenOutDecimals = getZapDecimals(tokenOut, wnative);
  const _tokenIn =
    tokenOut.id === vault.assetIds[0] ||
    (tokenOut.id === wnative.id && native.id === vault.assetIds[0])
      ? selectTokenById(state, vault.chainId, vault.assetIds[1])
      : tokenOut.id === vault.assetIds[1] ||
        (tokenOut.id === wnative.id && native.id === vault.assetIds[1])
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
  const pairContract = new web3.eth.Contract(uniswapV2PairABI, oracleToken.address);

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

  const reserveIn =
    tokenIn.address.toLocaleLowerCase() === pair.token0.toLocaleLowerCase()
      ? pair.reserves[0]
      : pair.reserves[1];
  const reserveOut =
    tokenOutAddress.toLocaleLowerCase() === pair.token1.toLocaleLowerCase()
      ? pair.reserves[1]
      : pair.reserves[0];

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
    amountOut: amountOut.shiftedBy(-tokenOutDecimals),
  };
};
