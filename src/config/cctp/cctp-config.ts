import type { ChainEntity } from '../../features/data/entities/chain.ts';
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
  /** CircleBeefyZapReceiver address with compression support */
  receiver2?: Address;
  /** Native USDC address on this chain */
  usdcAddress: Address;
  /** Circle CCTP domain ID */
  domain: number;
  /** Estimated bridge times in minutes */
  time: { outgoing: number; incoming: number };
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

// TokenMessengerV2 and MessageTransmitterV2 are deployed at the same addresses
// on all EVM chains via CREATE2
const TOKEN_MESSENGER_V2 = '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d';
const MESSAGE_TRANSMITTER_V2 = '0x81d40f21f12a8f0e3252bccb954d722d4c464b64';
const MAX_MESSAGE_BODY_SIZE = 8192; // bytes (if this ever changes we should read on chain)

export const CCTP_CONFIG: CCTPConfig = {
  chains: {
    arbitrum: {
      tokenMessenger: TOKEN_MESSENGER_V2,
      messageTransmitter: MESSAGE_TRANSMITTER_V2,
      maxMessageBodySize: MAX_MESSAGE_BODY_SIZE,
      receiver: '0xBeef940035C062bb8bEe892087aBa6Cde4F9BeEF',
      usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      domain: 3,
      time: { outgoing: 5, incoming: 5 },
      fastFeeBps: 1.3,
      beefyBridgeFeeUsd: 0.06,
    },
    avax: {
      tokenMessenger: TOKEN_MESSENGER_V2,
      messageTransmitter: MESSAGE_TRANSMITTER_V2,
      maxMessageBodySize: MAX_MESSAGE_BODY_SIZE,
      receiver: '0xBeef940035C062bb8bEe892087aBa6Cde4F9BeEF',
      usdcAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      domain: 1,
      time: { outgoing: 5, incoming: 5 },
      beefyBridgeFeeUsd: 0.02,
    },
    base: {
      tokenMessenger: TOKEN_MESSENGER_V2,
      messageTransmitter: MESSAGE_TRANSMITTER_V2,
      maxMessageBodySize: MAX_MESSAGE_BODY_SIZE,
      receiver: '0xBeef940035C062bb8bEe892087aBa6Cde4F9BeEF',
      receiver2: '0x52c53e3295bee49DB37c6aE260217c714624E3fC',
      usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      domain: 6,
      time: { outgoing: 5, incoming: 5 },
      fastFeeBps: 1.3,
      beefyBridgeFeeUsd: 0.07,
    },
    ethereum: {
      tokenMessenger: TOKEN_MESSENGER_V2,
      messageTransmitter: MESSAGE_TRANSMITTER_V2,
      maxMessageBodySize: MAX_MESSAGE_BODY_SIZE,
      receiver: '0xBeef940035C062bb8bEe892087aBa6Cde4F9BeEF',
      usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      domain: 0,
      time: { outgoing: 15, incoming: 15 },
      fastFeeBps: 1,
      beefyBridgeFeeUsd: 1,
    },
    hyperevm: {
      tokenMessenger: TOKEN_MESSENGER_V2,
      messageTransmitter: MESSAGE_TRANSMITTER_V2,
      maxMessageBodySize: MAX_MESSAGE_BODY_SIZE,
      receiver: '0xBeef940035C062bb8bEe892087aBa6Cde4F9BeEF',
      usdcAddress: '0xb88339CB7199b77E23DB6E890353E22632Ba630f',
      domain: 19,
      time: { outgoing: 5, incoming: 5 },
      beefyBridgeFeeUsd: 0.11,
    },
    linea: {
      tokenMessenger: TOKEN_MESSENGER_V2,
      messageTransmitter: MESSAGE_TRANSMITTER_V2,
      maxMessageBodySize: MAX_MESSAGE_BODY_SIZE,
      receiver: '0xBeef940035C062bb8bEe892087aBa6Cde4F9BeEF',
      usdcAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      domain: 11,
      time: { outgoing: 5, incoming: 5 },
      fastFeeBps: 11,
      beefyBridgeFeeUsd: 0.7,
    },
    monad: {
      tokenMessenger: TOKEN_MESSENGER_V2,
      messageTransmitter: MESSAGE_TRANSMITTER_V2,
      maxMessageBodySize: MAX_MESSAGE_BODY_SIZE,
      receiver: '0xBeef940035C062bb8bEe892087aBa6Cde4F9BeEF',
      usdcAddress: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603',
      domain: 15,
      time: { outgoing: 5, incoming: 5 },
      beefyBridgeFeeUsd: 0.01,
    },
    optimism: {
      tokenMessenger: TOKEN_MESSENGER_V2,
      messageTransmitter: MESSAGE_TRANSMITTER_V2,
      maxMessageBodySize: MAX_MESSAGE_BODY_SIZE,
      receiver: '0xBeef940035C062bb8bEe892087aBa6Cde4F9BeEF',
      usdcAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      domain: 2,
      time: { outgoing: 5, incoming: 5 },
      fastFeeBps: 1.3,
      beefyBridgeFeeUsd: 0.01,
    },
    polygon: {
      tokenMessenger: TOKEN_MESSENGER_V2,
      messageTransmitter: MESSAGE_TRANSMITTER_V2,
      maxMessageBodySize: MAX_MESSAGE_BODY_SIZE,
      receiver: '0xBeef940035C062bb8bEe892087aBa6Cde4F9BeEF',
      usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      domain: 7,
      time: { outgoing: 5, incoming: 5 },
      beefyBridgeFeeUsd: 0.03,
    },
    sonic: {
      tokenMessenger: TOKEN_MESSENGER_V2,
      messageTransmitter: MESSAGE_TRANSMITTER_V2,
      maxMessageBodySize: MAX_MESSAGE_BODY_SIZE,
      receiver: '0xBeef940035C062bb8bEe892087aBa6Cde4F9BeEF',
      usdcAddress: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
      domain: 13,
      time: { outgoing: 5, incoming: 5 },
      beefyBridgeFeeUsd: 0.01,
    },
  },
};
