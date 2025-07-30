import { type Address, encodeAbiParameters } from 'viem';

/** Magic prefix is keccak256("divvi").slice(2, 10) */
const DIVVI_MAGIC_PREFIX = '6decb85d';

/**
 * Format byte for referral tag encoding (format 1).
 * Represented as a 2-character hex string (1 byte).
 */
const REFERRAL_TAG_FORMAT_1_BYTE = '01';

/** OP treasury safe */
const BEEFY_REFERRAL_ADDRESS = '0x4ABa01FB8E1f6BFE80c56Deb367f19F35Df0f4aE';

/**
 * @see https://github.com/divvi-xyz/divvi-referral-sdk/blob/137a16d7f8fadc11431917f8a6d78439d1c6dbf9/src/index.ts#L49
 * For zero providers[], adds up to 1092 (46 * 16 + 88 * 4) gas to the transaction.
 */
export function getReferralTag(user: Address): string {
  const providers: Address[] = [];
  const payload = encodeAbiParameters(
    [
      {
        type: 'address',
        name: 'user',
      },
      {
        type: 'address',
        name: 'consumer',
      },
      {
        type: 'address[]',
        name: 'providers',
      },
    ],
    [user, BEEFY_REFERRAL_ADDRESS, providers]
  ).slice(2);
  // each byte is represented by 2 hex characters
  const payloadLength = payload.length / 2;
  // 4 hex characters for 2 bytes, max length of 65535 bytes
  const payloadLengthHex = payloadLength.toString(16).padStart(4, '0');
  if (payloadLengthHex.length !== 4) {
    throw new Error(`Payload length must be 2 bytes, got ${payloadLengthHex.length / 2} bytes`);
  }

  const header = `${DIVVI_MAGIC_PREFIX}${REFERRAL_TAG_FORMAT_1_BYTE}${payloadLengthHex}`;

  return `${header}${payload}`;
}
