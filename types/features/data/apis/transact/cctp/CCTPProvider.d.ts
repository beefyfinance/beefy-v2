import BigNumber from 'bignumber.js';
import { type Address, type Hex } from 'viem';
import { type CCTPChainConfig } from '../../../../../config/cctp/cctp-config';
import type { ChainEntity } from '../../../entities/chain';
import type { TokenErc20 } from '../../../entities/token';
import type { BeefyState } from '../../../store/types';
import type { ZapStep } from '../zap/types';
import type { CCTPBridgeQuote, ZapPayload } from './types';
export declare function getSupportedChainIds(): ChainEntity['id'][];
export declare function isChainSupported(chainId: ChainEntity['id']): boolean;
export declare function getChainConfig(chainId: ChainEntity['id']): CCTPChainConfig;
export declare function getUSDCForChain(chainId: ChainEntity['id'], state: BeefyState): TokenErc20;
/**
 * Compute the max fee in token units from an amount using the source chain's bps.
 * Adds a 15% buffer to account for potential fee fluctuations as recommended by Circle.
 * Ceils to token precision so the returned value is a real max (never underestimates).
 * @see https://developers.circle.com/cctp/concepts/fees#maximum-fee-parameter
 */
export declare function computeMaxFee(amount: BigNumber, feeBps: number, decimals: number): BigNumber;
export declare function getBridgeFeeForUsdcAmount(fromChainId: ChainEntity['id'], toChainId: ChainEntity['id'], usdcAmount: BigNumber, usdcDecimals: number): BigNumber;
export declare function fetchBridgeQuote(fromChainId: ChainEntity['id'], toChainId: ChainEntity['id'], amount: BigNumber, fromToken: TokenErc20, toToken: TokenErc20): CCTPBridgeQuote;
/**
 * Encode depositForBurnWithHook calldata (with hooks, restricted to receiver).
 * Used for cross-chain deposits that trigger a zap on the destination chain.
 */
export declare function buildDepositForBurnWithHookCalldata(destChainId: ChainEntity['id'], mintRecipient: Address, burnToken: Address, maxFee: bigint, hookData: Hex, destinationCaller?: Address): {
    data: Hex;
    amountIndex: number;
};
/**
 * Encode a ZapPayload struct via ABI encoding.
 * Converts string addresses/amounts to viem-compatible types.
 */
export declare function encodeZapPayload(payload: ZapPayload): Hex;
/**
 * Build hookData for CircleBeefyZapReceiver.
 * Format:
 * v1: [20 bytes: receiver address] + [ABI-encoded ZapPayload]
 * v2, uncompressed: [uint8(0) + ABI-encoded ZapPayload]
 * v2, compressed: [uint8(1) + uint24(length) + compressed payload]
 */
export declare function buildHookData(sourceChainId: ChainEntity['id'], destChainId: ChainEntity['id'], zapPayload: ZapPayload): {
    receiver: Address;
    hookData: Hex;
    oversized: boolean;
};
/**
 * Build a ZapStep that calls depositForBurnWithHook on TokenMessengerV2.
 * Used for cross-chain deposits with destination zap.
 */
export declare function buildBurnZapStep(sourceChainId: ChainEntity['id'], destChainId: ChainEntity['id'], usdcAddress: string, mintRecipient: Address, maxFee: bigint, hookData: Hex, destinationCaller?: Address): ZapStep;
