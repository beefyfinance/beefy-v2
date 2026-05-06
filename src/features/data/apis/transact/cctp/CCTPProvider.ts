import BigNumber from 'bignumber.js';
import {
  type Address,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  type Hex,
  pad,
} from 'viem';
import { ZapPayloadAbiParams } from '../../../../../config/abi/CircleBeefyZapReceiverAbi.ts';
import { CCTPTokenMessengerV2Abi } from '../../../../../config/abi/CCTPTokenMessengerV2Abi.ts';
import { CCTP_CONFIG, type CCTPChainConfig } from '../../../../../config/cctp/cctp-config.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenErc20 } from '../../../entities/token.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import { CrossChainBridgeBelowFeeError } from '../strategies/error.ts';
import { getInsertIndex, NO_RELAY } from '../helpers/zap.ts';
import type { ZapStep } from '../zap/types.ts';
import type { CCTPBridgeQuote, ZapPayload } from './types.ts';
import { compressHex } from './compress.ts';

// uint32(4) + bytes32 + bytes32 + uint256(32) + bytes32 + uint256(32) + uint256(32) + uint256(32) (+ bytes hookdata)
const MIN_BURN_MESSAGE_BODY_SIZE = 228;

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
 * Adds a 15% buffer to account for potential fee fluctuations as recommended by Circle.
 * Ceils to token precision so the returned value is a real max (never underestimates).
 * @see https://developers.circle.com/cctp/concepts/fees#maximum-fee-parameter
 */
export function computeMaxFee(amount: BigNumber, feeBps: number, decimals: number): BigNumber {
  const calculatedFee = amount.multipliedBy(feeBps).dividedBy(10000);
  // Add 15% buffer and ceil to token precision to ensure we never underpay
  return calculatedFee.multipliedBy(1.15).decimalPlaces(decimals, BigNumber.ROUND_CEIL);
}

export function getBridgeFeeForUsdcAmount(
  fromChainId: ChainEntity['id'],
  toChainId: ChainEntity['id'],
  usdcAmount: BigNumber,
  usdcDecimals: number
): BigNumber {
  const fromConfig = getChainConfig(fromChainId);
  const toConfig = getChainConfig(toChainId);
  const cctpFee =
    fromConfig.fastFeeBps !== undefined ?
      computeMaxFee(usdcAmount, fromConfig.fastFeeBps, usdcDecimals)
    : new BigNumber(0);
  return cctpFee.plus(toConfig.beefyBridgeFeeUsd);
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
  const fee = getBridgeFeeForUsdcAmount(fromChainId, toChainId, amount, fromToken.decimals);

  // Truncate to token precision so downstream strategies never see sub-wei amounts
  const fromAmount = amount.decimalPlaces(fromToken.decimals, BigNumber.ROUND_FLOOR);
  if (fromAmount.lte(fee)) {
    throw new CrossChainBridgeBelowFeeError(
      `CCTP bridge: input ${fromAmount.toString()} ${fromToken.symbol} on ${fromChainId} does not cover the bridge fee ${fee.toString()} ${fromToken.symbol} required to reach ${toChainId}`
    );
  }
  const toAmount = fromAmount.minus(fee).decimalPlaces(toToken.decimals, BigNumber.ROUND_FLOOR);

  return {
    fromChainId,
    toChainId,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    fee,
    timeEstimate,
  };
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
  hookData: Hex,
  destinationCaller: Address = mintRecipient
): { data: Hex; amountIndex: number } {
  const destConfig = getChainConfig(destChainId);

  console.debug('[CCTP] buildDepositForBurnWithHookCalldata', {
    destChainId,
    destDomain: destConfig.domain,
    mintRecipient,
    burnToken,
    destinationCaller,
    maxFee: maxFee.toString(),
    minFinalityThreshold: 0,
    hookDataLength: hookData.length,
  });

  const data = encodeFunctionData({
    abi: CCTPTokenMessengerV2Abi,
    functionName: 'depositForBurnWithHook',
    args: [
      0n, // amount: placeholder, ZapRouter inserts actual balance
      destConfig.domain,
      pad(mintRecipient, { size: 32 }),
      burnToken,
      pad(destinationCaller, { size: 32 }), // destinationCaller: restricted to receiver
      maxFee,
      0, // minFinalityThreshold: fast (≤1000 treated as 1000 = confirmed)
      hookData,
    ],
  });

  const amountIndex = getInsertIndex(0);

  console.debug('[CCTP] buildDepositForBurnWithHookCalldata result', {
    dataLength: data.length,
    amountIndex,
  });

  return { data, amountIndex };
}

/**
 * Encode a ZapPayload struct via ABI encoding.
 * Converts string addresses/amounts to viem-compatible types.
 */
export function encodeZapPayload(payload: ZapPayload): Hex {
  console.debug('[CCTP] encodeZapPayload', {
    recipient: payload.recipient,
    outputsCount: payload.outputs.length,
    outputs: payload.outputs,
    relay: payload.relay,
    routeSteps: payload.route.length,
    route: payload.route.map((step, i) => ({
      index: i,
      target: step.target,
      value: step.value,
      dataLength: step.data.length,
      tokens: step.tokens,
    })),
  });

  const encoded = encodeAbiParameters(ZapPayloadAbiParams, [
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

  console.debug('[CCTP] encodeZapPayload result', {
    encodedLength: encoded.length,
    encoded,
  });

  return encoded;
}

/**
 * Build hookData for CircleBeefyZapReceiver.
 * Format:
 * v1: [20 bytes: receiver address] + [ABI-encoded ZapPayload]
 * v2, uncompressed: [uint8(0) + ABI-encoded ZapPayload]
 * v2, compressed: [uint8(1) + uint24(length) + compressed payload]
 */
export function buildHookData(
  sourceChainId: ChainEntity['id'],
  destChainId: ChainEntity['id'],
  zapPayload: ZapPayload
): { receiver: Address; hookData: Hex; oversized: boolean } {
  const sourceConfig = getChainConfig(sourceChainId);
  const destConfig = getChainConfig(destChainId);
  console.debug('[CCTP] buildHookData', {
    sourceChainId,
    destChainId,
    receiver: destConfig.receiver,
  });

  const encodedPayload = encodeZapPayload(zapPayload);
  const availableBytes =
    Math.min(sourceConfig.maxMessageBodySize, destConfig.maxMessageBodySize) -
    MIN_BURN_MESSAGE_BODY_SIZE;
  const payloadBytes = hexToBytesCount(encodedPayload);
  const uncompressedHookDataByteSize = payloadBytes + 1;

  // V2: no compression needed [uint8(0) + zap payload]
  if (uncompressedHookDataByteSize <= availableBytes) {
    console.debug('[CCTP] buildHookData result', {
      type: 'uncompressed',
      payloadBytes,
      hookDataBytes: uncompressedHookDataByteSize,
    });
    return {
      receiver: destConfig.receiver,
      hookData: encodePacked(['uint8', 'bytes'], [0, encodedPayload]),
      oversized: false,
    };
  }

  // payload is bigger than uint24 max (this would revert anyway)
  const maxUncompressedBytes = 2 ** 24 - 1; // uint24
  if (payloadBytes > maxUncompressedBytes) {
    throw new Error(`CCTP hookData payload size ${uncompressedHookDataByteSize} bytes exceeds max`);
  }

  // V2 compressed: [uint8(1) + uint24(length) + compressed payload]
  const hookData = compressHex(encodedPayload); // already has the 4 byte header
  const hookDataByteSize = hexToBytesCount(hookData);
  console.debug('[CCTP] buildHookData result', {
    type: 'compressed',
    payloadBytes,
    hookDataBytes: hexToBytesCount(hookData),
  });

  return {
    receiver: destConfig.receiver,
    hookData,
    oversized: hookDataByteSize > availableBytes,
  };
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
  hookData: Hex,
  destinationCaller: Address = mintRecipient
): ZapStep {
  const sourceConfig = getChainConfig(sourceChainId);
  console.debug('[CCTP] buildBurnZapStep', {
    sourceChainId,
    destChainId,
    usdcAddress,
    mintRecipient,
    maxFee: maxFee.toString(),
    tokenMessenger: sourceConfig.tokenMessenger,
  });

  const { data, amountIndex } = buildDepositForBurnWithHookCalldata(
    destChainId,
    mintRecipient,
    usdcAddress as Address,
    maxFee,
    hookData,
    destinationCaller
  );

  const zapStep: ZapStep = {
    target: sourceConfig.tokenMessenger,
    value: '0',
    data,
    tokens: [{ token: usdcAddress, index: amountIndex }],
  };

  console.debug('[CCTP] buildBurnZapStep result', {
    target: zapStep.target,
    value: zapStep.value,
    dataLength: zapStep.data.length,
    tokens: zapStep.tokens,
  });

  return zapStep;
}

/**
 * Build a ZapStep that calls depositForBurnWithHook on TokenMessengerV2
 * with a minimal passthrough ZapPayload (empty route, single USDC output).
 * Used for simple cross-chain USDC transfers that need to go through
 * CircleBeefyZapReceiver so the destination fee can be collected.
 */
export function buildBurnZapStepPassthrough(
  sourceChainId: ChainEntity['id'],
  destChainId: ChainEntity['id'],
  usdcAddress: Address,
  userAddress: Address,
  maxFee: bigint
): ZapStep {
  const sourceConfig = getChainConfig(sourceChainId);
  const destConfig = getChainConfig(destChainId);

  console.debug('[CCTP] buildBurnZapStepPassthrough', {
    sourceChainId,
    destChainId,
    usdcAddress,
    userAddress,
    maxFee: maxFee.toString(),
  });

  const zapPayload: ZapPayload = {
    recipient: userAddress,
    outputs: [{ token: destConfig.usdcAddress, minOutputAmount: '0' }],
    relay: NO_RELAY,
    route: [],
  };

  const { hookData, receiver, oversized } = buildHookData(sourceChainId, destChainId, zapPayload);
  if (oversized) {
    throw new Error(
      `CCTP hookData size exceeds maxMessageBodySize for chain ${destChainId}, cannot build passthrough ZapStep`
    );
  }

  const { data, amountIndex } = buildDepositForBurnWithHookCalldata(
    destChainId,
    receiver,
    usdcAddress,
    maxFee,
    hookData
  );

  const zapStep: ZapStep = {
    target: sourceConfig.tokenMessenger,
    value: '0',
    data,
    tokens: [{ token: usdcAddress, index: amountIndex }],
  };

  console.debug('[CCTP] buildBurnZapStepPassthrough result', {
    target: zapStep.target,
    value: zapStep.value,
    dataLength: zapStep.data.length,
    tokens: zapStep.tokens,
  });

  return zapStep;
}

function hexToBytesCount(data: Hex): number {
  return (data.length - 2) / 2;
}
