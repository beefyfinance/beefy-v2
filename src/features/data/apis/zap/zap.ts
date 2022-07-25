import { BeefyState } from '../../../../redux-types';
import { isTokenErc20, isTokenNative, TokenEntity } from '../../entities/token';
import { isStandardVault, VaultEntity } from '../../entities/vault';
import { selectChainById } from '../../selectors/chains';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectIsTokenLoaded,
  selectTokenByAddress,
  selectTokenById,
} from '../../selectors/tokens';
import { selectVaultById } from '../../selectors/vaults';
import { getZapAddress, getZapDecimals } from '../../utils/zap-utils';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { ZapConfig } from '../config-types';
import {
  computeSolidlyPairAddress,
  estimateZapDepositSolidly,
  estimateZapWithdrawSolidly,
} from './solidly';
import {
  computeUniswapV2PairAddress,
  estimateZapDepositUniswapV2,
  estimateZapWithdrawUniswapV2,
} from './uniswap-v2';
import { ZapDepositEstimate, ZapOptions, ZapWithdrawEstimate } from './zap-types';
import { getOppositeToken } from './helpers';

const zapOptionsCache: { [vaultId: VaultEntity['id']]: ZapOptions | null } = {};

const estimateZapDepositFunctions: Record<ZapConfig['type'], typeof estimateZapDepositUniswapV2> = {
  uniswapv2: estimateZapDepositUniswapV2,
  solidly: estimateZapDepositSolidly,
};

const estimateZapWithdrawFunctions: Record<ZapConfig['type'], typeof estimateZapWithdrawUniswapV2> =
  {
    uniswapv2: estimateZapWithdrawUniswapV2,
    solidly: estimateZapWithdrawSolidly,
  };

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

  const zap = isTokenErc20(depositToken)
    ? state.entities.zaps.byChainId[vault.chainId].find(zap => {
        const token0 = getZapAddress(tokenA, wnative);
        const token1 = getZapAddress(tokenB, wnative);
        const computed = [];

        switch (zap.type) {
          case 'solidly': {
            computed.push(
              computeSolidlyPairAddress(zap.ammFactory, zap.ammPairInitHash, token0, token1, true)
            );
            computed.push(
              computeSolidlyPairAddress(zap.ammFactory, zap.ammPairInitHash, token0, token1, false)
            );
            break;
          }
          case 'uniswapv2':
          default: {
            computed.push(
              computeUniswapV2PairAddress(zap.ammFactory, zap.ammPairInitHash, token0, token1)
            );
            break;
          }
        }

        return computed.includes(depositToken.address);
      })
    : null;

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
    type: zap.type || 'uniswapv2',
    withdrawEstimateMode: zap.withdrawEstimateMode || 'getAmountOut',
    withdrawEstimateFee: zap.withdrawEstimateFee || '0',
    lpProviderFee: zap.lpProviderFee || 0,
  };
  zapOptionsCache[vaultId] = zapOptions;
  return zapOptions;
}

export async function estimateZapDeposit(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  inputTokenId: TokenEntity['id']
): Promise<ZapDepositEstimate> {
  // Non-standard vaults do not have earnContractAddress
  const vault = selectVaultById(state, vaultId);
  if (!isStandardVault(vault)) {
    throw new Error(`Only standard vaults are supported`);
  }

  // Get tokenIn and tokenOut for swap
  const amount = state.ui.deposit.amount;
  const wnative = selectChainWrappedNativeToken(state, vault.chainId);
  const native = selectChainNativeToken(state, vault.chainId);
  const tokenIn = selectTokenById(state, vault.chainId, inputTokenId);
  const tokenOut = getOppositeToken(state, tokenIn, vault, wnative, native);

  // Zapping 0
  if (amount.isZero()) {
    return {
      tokenIn,
      tokenOut,
      amountIn: BIG_ZERO,
      amountOut: BIG_ZERO,
      priceImpact: 0,
    };
  }

  // If zapping native, use wnative for calculation
  const tokenInAddress = getZapAddress(tokenIn, wnative);
  const tokenInDecimals = getZapDecimals(tokenIn, wnative);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const chain = selectChainById(state, vault.chainId);
  const zapOptions = state.ui.deposit.zapOptions;

  // Handle different LP types
  const estimateFunction = estimateZapDepositFunctions[zapOptions.type];

  return estimateFunction(
    zapOptions,
    vault,
    chain,
    amount,
    depositToken,
    tokenIn,
    tokenInAddress,
    tokenInDecimals,
    tokenOut
  );
}

export async function estimateZapWithdraw(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  outputTokenId: TokenEntity['id']
): Promise<ZapWithdrawEstimate> {
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

  // no zap for native tokens or 0 amounts
  if (amount.isZero() || !isTokenErc20(depositToken)) {
    return {
      tokenIn,
      tokenOut,
      amountIn: BIG_ZERO,
      amountOut: BIG_ZERO,
      totalOut: BIG_ZERO,
      priceImpact: 0,
    };
  }

  // Handle different LP types
  const estimateFunction = estimateZapWithdrawFunctions[zapOptions.type];

  return estimateFunction(
    zapOptions,
    vault,
    chain,
    amount,
    depositToken,
    tokenIn,
    tokenOut,
    tokenOutAddress,
    tokenOutDecimals
  );
}
