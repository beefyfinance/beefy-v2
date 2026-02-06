import BigNumber from 'bignumber.js';
import { type Address, type Hex, encodeAbiParameters, encodeFunctionData, pad } from 'viem';
import { ZapPayloadAbiParams } from '../../../../../config/abi/CircleBeefyZapReceiverAbi.ts';
import { CCTPTokenMessengerV2Abi } from '../../../../../config/abi/CCTPTokenMessengerV2Abi.ts';
import { CCTP_CONFIG, type CCTPChainConfig } from '../../../../../config/cctp/cctp-config.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenErc20 } from '../../../entities/token.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import { getInsertIndex } from '../helpers/zap.ts';
import type { ZapStep } from '../zap/types.ts';
import type { CCTPBridgeQuote, ZapPayload } from './types.ts';

const ZERO_BYTES32 = pad('0x00' as Hex, { size: 32 });

export function getSupportedChainIds(): ChainEntity['id'][] {
  return Object.keys(CCTP_CONFIG.chains) as ChainEntity['id'][];
}

export function isChainSupported(chainId: ChainEntity['id']): boolean {
  return chainId in CCTP_CONFIG.chains;
}

export function getChainConfig(chainId: ChainEntity['id']): CCTPChainConfig {
  const config = CCTP_CONFIG.chains[chainId];
  if (!config) {
    throw new Error(`CCTP not supported on chain ${chainId}`);
  }
  return config;
}

export function getUSDCForChain(chainId: ChainEntity['id'], state: BeefyState): TokenErc20 {
  const config = getChainConfig(chainId);
  return selectTokenByAddress(state, chainId, config.usdcAddress) as TokenErc20;
}

/**
 * Compute the max fee in token units from an amount using the source chain's bps.
 */
export function computeMaxFee(amount: BigNumber, feeBps: number): BigNumber {
  return amount.multipliedBy(feeBps).dividedToIntegerBy(10000);
}

export function fetchBridgeQuote(
  fromChainId: ChainEntity['id'],
  toChainId: ChainEntity['id'],
  amount: BigNumber,
  fromToken: TokenErc20,
  toToken: TokenErc20
): CCTPBridgeQuote {
  const fromConfig = getChainConfig(fromChainId);
  const toConfig = getChainConfig(toChainId);
  const timeEstimate = fromConfig.time.outgoing + toConfig.time.incoming;
  const fee =
    fromConfig.fastFeeBps !== undefined ?
      computeMaxFee(amount, fromConfig.fastFeeBps)
    : new BigNumber(0);

  return {
    fromChainId,
    toChainId,
    fromToken,
    toToken,
    fromAmount: amount,
    toAmount: amount.minus(fee),
    fee,
    timeEstimate,
  };
}

/**
 * Encode depositForBurn calldata (no hooks, unrestricted relay).
 * Used for simple cross-chain USDC transfers.
 */
export function buildDepositForBurnCalldata(
  destChainId: ChainEntity['id'],
  mintRecipient: Address,
  burnToken: Address,
  maxFee: bigint
): { data: Hex; amountIndex: number } {
  const destConfig = getChainConfig(destChainId);

  const data = encodeFunctionData({
    abi: CCTPTokenMessengerV2Abi,
    functionName: 'depositForBurn',
    args: [
      0n, // amount: placeholder, ZapRouter inserts actual balance
      destConfig.domain,
      pad(mintRecipient, { size: 32 }),
      burnToken,
      ZERO_BYTES32, // destinationCaller: unrestricted
      maxFee,
      0, // minFinalityThreshold: fast (≤1000 treated as 1000 = confirmed)
    ],
  });

  return { data, amountIndex: getInsertIndex(0) };
}

/**
 * Encode depositForBurnWithHook calldata (with hooks, restricted to receiver).
 * Used for cross-chain deposits that trigger a zap on the destination chain.
 */
export function buildDepositForBurnWithHookCalldata(
  destChainId: ChainEntity['id'],
  mintRecipient: Address,
  burnToken: Address,
  maxFee: bigint,
  hookData: Hex
): { data: Hex; amountIndex: number } {
  const destConfig = getChainConfig(destChainId);

  const data = encodeFunctionData({
    abi: CCTPTokenMessengerV2Abi,
    functionName: 'depositForBurnWithHook',
    args: [
      0n, // amount: placeholder, ZapRouter inserts actual balance
      destConfig.domain,
      pad(mintRecipient, { size: 32 }),
      burnToken,
      pad(destConfig.receiver as Address, { size: 32 }), // destinationCaller: restricted to receiver
      maxFee,
      0, // minFinalityThreshold: fast (≤1000 treated as 1000 = confirmed)
      hookData,
    ],
  });

  return { data, amountIndex: getInsertIndex(0) };
}

/**
 * Encode a ZapPayload struct via ABI encoding.
 * Converts string addresses/amounts to viem-compatible types.
 */
export function encodeZapPayload(payload: ZapPayload): Hex {
  return encodeAbiParameters(ZapPayloadAbiParams, [
    {
      recipient: payload.recipient as Address,
      outputs: payload.outputs.map(o => ({
        token: o.token as Address,
        minOutputAmount: BigInt(o.minOutputAmount),
      })),
      relay: {
        target: payload.relay.target as Address,
        value: BigInt(payload.relay.value),
        data: payload.relay.data as Hex,
      },
      route: payload.route.map(step => ({
        target: step.target as Address,
        value: BigInt(step.value),
        data: step.data as Hex,
        tokens: step.tokens.map(t => ({
          token: t.token as Address,
          index: t.index,
        })),
      })),
    },
  ]);
}

/**
 * Build hookData for CircleBeefyZapReceiver.
 * Format: [20 bytes: receiver address] + [ABI-encoded ZapPayload]
 */
export function buildHookData(destChainId: ChainEntity['id'], zapPayload: ZapPayload): Hex {
  const destConfig = getChainConfig(destChainId);
  const encodedPayload = encodeZapPayload(zapPayload);
  // hookData = receiver address (20 bytes) + encoded ZapPayload (without 0x prefix)
  return `${destConfig.receiver}${encodedPayload.slice(2)}` as Hex;
}

/**
 * Build a ZapStep that calls depositForBurnWithHook on TokenMessengerV2.
 * Used for cross-chain deposits with destination zap.
 */
export function buildBurnZapStep(
  sourceChainId: ChainEntity['id'],
  destChainId: ChainEntity['id'],
  usdcAddress: string,
  mintRecipient: Address,
  maxFee: bigint,
  hookData: Hex
): ZapStep {
  const sourceConfig = getChainConfig(sourceChainId);
  const { data, amountIndex } = buildDepositForBurnWithHookCalldata(
    destChainId,
    mintRecipient,
    usdcAddress as Address,
    maxFee,
    hookData
  );

  return {
    target: sourceConfig.tokenMessenger,
    value: '0',
    data,
    tokens: [{ token: usdcAddress, index: amountIndex }],
  };
}

/**
 * Build a ZapStep that calls depositForBurn on TokenMessengerV2.
 * Used for simple cross-chain USDC transfers (no hooks).
 */
export function buildBurnZapStepSimple(
  sourceChainId: ChainEntity['id'],
  destChainId: ChainEntity['id'],
  usdcAddress: string,
  mintRecipient: Address,
  maxFee: bigint
): ZapStep {
  const sourceConfig = getChainConfig(sourceChainId);
  const { data, amountIndex } = buildDepositForBurnCalldata(
    destChainId,
    mintRecipient,
    usdcAddress as Address,
    maxFee
  );

  return {
    target: sourceConfig.tokenMessenger,
    value: '0',
    data,
    tokens: [{ token: usdcAddress, index: amountIndex }],
  };
}
