import type { ChainEntity } from '../../features/data/entities/chain';
import type { Address } from 'viem';
/**
 * CCTP V2 Finality Thresholds:
 * @see https://developers.circle.com/cctp/references/technical-guide#finality-thresholds
 * - minFinalityThreshold ≤ 1000: Fast (confirmed level). Any value <1000 is treated as 1000.
 * - minFinalityThreshold > 1000: Standard (finalized level). Any value >1000 is treated as 2000.
 *
 * CCTP V2 Fee Model (finality-indexed):
 * @see https://developers.circle.com/cctp/references/technical-guide#fees
 * - Standard transfers: 0 bps on all chains (slower, waits for full finality).
 * - Fast transfers: per-chain bps (see fastFeeBps below). Attested at confirmed level.
 *
 * Fee/Finality interaction:
 * - If maxFee ≥ fast fee AND minFinalityThreshold ≤ 1000 → Fast Transfer (fee = fast bps).
 * - If maxFee < fast fee AND minFinalityThreshold ≤ 1000 → falls back to Standard (fee = 0, slower).
 * - If maxFee < standard fee (0) → transaction reverts.
 *
 * We use fast transfers where available (minFinalityThreshold = 0, treated as 1000).
 * For fast: maxFee must be ≥ fastFeeBps or it falls back to standard.
 * For standard-only chains (fastFeeBps omitted): maxFee = 0 (standard fee is 0 bps on all chains).
 *
 * Not all chains support fast transfer or the forwarding service (hooks).
 * Only chains with forwarding service can be used as destination for cross-chain zaps.
 * Chains without fast transfer use standard only (0 bps fee, slower).
 *
 * Supported chains (as of 2026-02):
 * @see https://developers.circle.com/cctp/cctp-supported-blockchains
 * Chain          | Domain | Fast | Forwarding
 * Ethereum       |   0    |  ✓  |     ✓
 * Avalanche      |   1    |  ✗  |     ✓
 * OP Mainnet     |   2    |  ✓  |     ✓
 * Arbitrum       |   3    |  ✓  |     ✓
 * Base           |   6    |  ✓  |     ✓
 * Polygon PoS    |   7    |  ✗  |     ✓
 * Linea          |  11    |  ✓  |     ✓
 * Sonic          |  13    |  ✗  |     ✓
 * Monad          |  15    |  ✗  |     ✓
 * HyperEVM       |  19    |  ✗  |     ✓
 */
export type CCTPChainConfig = {
    /** CCTP V2 TokenMessengerV2 proxy address */
    tokenMessenger: Address;
    /** CCTP V2 MessageTransmitterV2 proxy address */
    messageTransmitter: Address;
    /** MessageTransmitterV2.maxMessageBodySize() */
    maxMessageBodySize: number;
    /** CircleBeefyZapReceiver address */
    receiver: Address;
    /** Native USDC address on this chain */
    usdcAddress: Address;
    /** Circle CCTP domain ID */
    domain: number;
    /** Estimated bridge times in minutes */
    time: {
        outgoing: number;
        incoming: number;
    };
    /**
     * Fast Transfer fee in bps for this source chain (e.g. 1.3 = 0.013%).
     * Used as maxFee in depositForBurn calls. Must not be set lower than Circle's
     * minimum fast fee for this chain, or the transfer will fall back to standard (slower).
     * Omit for chains that don't support fast transfers (standard transfer, 0 fee).
     */
    fastFeeBps?: number;
    /** Flat fee in USD charged by Beefy when this chain is the destination of a cross-chain zap */
    beefyBridgeFeeUsd: number;
};
export type CCTPConfig = {
    chains: Partial<Record<ChainEntity['id'], CCTPChainConfig>>;
};
export declare const CCTP_CONFIG: CCTPConfig;
