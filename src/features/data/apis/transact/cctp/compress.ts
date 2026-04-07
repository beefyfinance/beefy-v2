import { bytesToHex, hexToBytes } from 'viem';

/**
 * Compresses arbitrary byte data using a chunk-based zero-stripping scheme
 * compatible with the solidity `Decompressor` library.
 *
 * The output format is:
 * - **4-byte header**: uint8 isCompressed flag +original uncompressed length as a big-endian uint24.
 * - **Chunk records**: the input is processed in 32-byte chunks (zero-padded
 *   to the nearest 32-byte boundary). Each chunk is encoded as one of:
 *   - `0x00` — all-zero chunk (1 byte total).
 *   - `payloadLength (1–32)` — right-aligned chunk (leading zeroes stripped).
 *     Bit 7 is 0; bits 0–6 hold the number of significant bytes that follow.
 *   - `0x80 | payloadLength (1–32)` — left-aligned chunk (trailing zeroes
 *     stripped). Bit 7 is 1; bits 0–6 hold the number of significant bytes
 *     that follow.
 *
 * The side with more zeroes (leading or trailing) is always stripped to
 * maximize compression.
 *
 * @param data - Raw bytes to compress.
 * @returns Compressed bytes
 */
export function compress(data: Uint8Array): Uint8Array {
  const out: number[] = [];
  const len = data.length;

  // Header with isCompressed=1 and original length (3 bytes big-endian)
  out.push(
    0x01, // isCompressed flag
    (len >>> 16) & 0xff,
    (len >>> 8) & 0xff,
    len & 0xff
  );

  // Pad data to nearest 32 byte multiple for correct chunking
  const paddedLen = Math.ceil(len / 32) * 32;
  const paddedData = new Uint8Array(paddedLen);
  paddedData.set(data);

  for (let i = 0; i < paddedLen; i += 32) {
    const chunk = paddedData.slice(i, i + 32);
    let leftZeroes = 0;
    let rightZeroes = 0;

    // Count leading (left) zeroes
    while (leftZeroes < 32 && chunk[leftZeroes] === 0) {
      leftZeroes++;
    }

    // Count trailing (right) zeroes
    while (rightZeroes < 32 && chunk[31 - rightZeroes] === 0) {
      rightZeroes++;
    }

    if (leftZeroes === 32) {
      // All zeroes. Output a 0-length right-aligned header.
      // Bit 7: 0 (Right aligned), Bits 0-6: 0
      out.push(0x00);
      continue;
    }

    // Choose the highest compression
    if (leftZeroes >= rightZeroes) {
      // Right Aligned (e.g. uint256 with leading zeroes)
      // Bit 7: 0
      const payloadLength = 32 - leftZeroes;
      out.push(payloadLength);
      for (let j = leftZeroes; j < 32; j++) {
        const val = chunk[j];
        if (val === undefined) throw new Error('Invalid chunk padding');
        out.push(val);
      }
    } else {
      // Left Aligned (e.g. bytes32 strings with trailing zeroes)
      // Bit 7: 1
      const payloadLength = 32 - rightZeroes;
      out.push(0b010000000 | payloadLength);
      for (let j = 0; j < payloadLength; j++) {
        const val = chunk[j];
        if (val === undefined) throw new Error('Invalid chunk padding');
        out.push(val);
      }
    }
  }
  return new Uint8Array(out);
}

export function compressHex(hex: `0x${string}`): `0x${string}` {
  const bytes = hexToBytes(hex);
  const compressed = compress(bytes);
  return bytesToHex(compressed);
}
