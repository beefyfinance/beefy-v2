import { createClient, custom, type EIP1193RequestFn } from 'viem';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForWalletToSeeMined } from './common.ts';

const chainId = 8453;
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

function wallet({
  chain = () => chainId,
  transaction,
}: {
  chain?: (call: number) => number;
  transaction: (call: number) => unknown;
}) {
  let chainCalls = 0;
  let txCalls = 0;
  const request = vi.fn(async ({ method }: { method: string }) => {
    if (method === 'eth_chainId') {
      return `0x${chain(++chainCalls).toString(16)}`;
    }
    if (method === 'eth_getTransactionByHash') {
      return transaction(++txCalls);
    }
    throw new Error(`unexpected ${method}`);
  });
  return {
    client: createClient({
      transport: custom({ request: request as unknown as EIP1193RequestFn }, { retryCount: 0 }),
    }),
    txCalls: () => txCalls,
  };
}

describe('waitForWalletToSeeMined', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('resolves once the wallet reports a block number', async () => {
    const { client, txCalls } = wallet({ transaction: call => tx(call < 3 ? null : '0x10') });
    const done = waitForWalletToSeeMined(client, chainId, hash);
    await vi.advanceTimersByTimeAsync(5_000);
    await done;
    expect(txCalls()).toBe(3);
  });

  it('resolves without checking the tx when the wallet is on another chain', async () => {
    const { client, txCalls } = wallet({ chain: () => 10, transaction: () => tx(null) });
    await waitForWalletToSeeMined(client, chainId, hash);
    expect(txCalls()).toBe(0);
  });

  it('resolves when the wallet switches chain while the tx is pending', async () => {
    const { client, txCalls } = wallet({
      chain: call => (call < 3 ? chainId : 10),
      transaction: () => tx(null),
    });
    const done = waitForWalletToSeeMined(client, chainId, hash);
    await vi.advanceTimersByTimeAsync(5_000);
    await done;
    expect(txCalls()).toBe(2);
  });

  it('gives up at the timeout when the wallet keeps reporting the tx as pending', async () => {
    const { client } = wallet({ transaction: () => tx(null) });
    let settled = false;
    void waitForWalletToSeeMined(client, chainId, hash, 15_000).then(() => (settled = true));
    await vi.advanceTimersByTimeAsync(14_999);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toBe(true);
  });

  it('gives up at the timeout when the wallet never answers', async () => {
    const { client } = wallet({ transaction: () => new Promise(() => {}) });
    let settled = false;
    void waitForWalletToSeeMined(client, chainId, hash, 15_000).then(() => (settled = true));
    await vi.advanceTimersByTimeAsync(15_000);
    expect(settled).toBe(true);
  });

  it('rejects when the wallet errors', async () => {
    const { client } = wallet({
      transaction: () => {
        throw new Error('method not supported');
      },
    });
    await expect(waitForWalletToSeeMined(client, chainId, hash)).rejects.toThrow();
  });
});
