import { createClient, custom, type EIP1193RequestFn } from 'viem';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForWalletToSeeMined } from './common.ts';

const hash = `0x${'ab'.repeat(32)}` as const;
const tx = (blockNumber: string | null) => ({
  hash,
  blockNumber,
  blockHash: blockNumber ? `0x${'cd'.repeat(32)}` : null,
  transactionIndex: blockNumber ? '0x0' : null,
  from: `0x${'11'.repeat(20)}`,
  to: `0x${'22'.repeat(20)}`,
  input: '0x',
  value: '0x0',
  nonce: '0x1',
  gas: '0x5208',
  type: '0x2',
});

function walletReturning(answer: (call: number) => unknown) {
  let calls = 0;
  const request = vi.fn(() => answer(++calls)) as unknown as EIP1193RequestFn;
  return { client: createClient({ transport: custom({ request }) }), request };
}

describe('waitForWalletToSeeMined', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('resolves once the wallet reports a block number', async () => {
    const { client, request } = walletReturning(call => tx(call < 3 ? null : '0x10'));
    const done = waitForWalletToSeeMined(client, hash);
    await vi.advanceTimersByTimeAsync(5_000);
    await done;
    expect(request).toHaveBeenCalledTimes(3);
  });

  it('gives up at the cap when the wallet keeps reporting the tx as pending', async () => {
    const { client } = walletReturning(() => tx(null));
    let settled = false;
    void waitForWalletToSeeMined(client, hash, 15_000).then(() => (settled = true));
    await vi.advanceTimersByTimeAsync(14_000);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(2_000);
    expect(settled).toBe(true);
  });

  it('gives up at the cap when the wallet never answers', async () => {
    const { client } = walletReturning(() => new Promise(() => {}));
    let settled = false;
    void waitForWalletToSeeMined(client, hash, 15_000).then(() => (settled = true));
    await vi.advanceTimersByTimeAsync(20_000);
    expect(settled).toBe(true);
  });
});
