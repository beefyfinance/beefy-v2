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
export declare function compress(data: Uint8Array): Uint8Array;
export declare function compressHex(hex: `0x${string}`): `0x${string}`;
