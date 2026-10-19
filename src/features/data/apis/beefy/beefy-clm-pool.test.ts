import BigNumber from 'bignumber.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChainEntity } from '../../entities/chain.ts';
import type { TokenEntity } from '../../entities/token.ts';
import { BeefyCLMPool } from './beefy-clm-pool.ts';

const reads = vi.hoisted(() => ({
  actionable: vi.fn(),
  actionableAt: vi.fn(),
  previewDeposit: vi.fn(),
  previewWithdraw: vi.fn(),
  isCalm: vi.fn(),
  balances: vi.fn(),
  totalSupply: vi.fn(),
}));
vi.mock('../rpc-contract/viem-contract.ts', () => ({
  fetchContract: () => ({ read: reads }),
}));

const strategies = [
  '0x177Ff2938dDaC11f8c909FcDB9FDd15dbFA04F37',
  '0x8337c691C3afA52ccE418178e52ed472F034Cb8b',
  '0xd7F3bCDAfCFf0018953BB6944Db2683Ff2e42b07',
  '0x64C54158587297F937A24a78691A9964c4CAa0A3',
];
const strategy = strategies[0];
const tokens = [{ decimals: 18 }, { decimals: 6 }] as TokenEntity[];
const pool = (chain = 'arc', address = strategy) =>
  new BeefyCLMPool('clm', address, { id: chain } as ChainEntity, tokens, true);

beforeEach(() => {
  vi.resetAllMocks();
  reads.actionable.mockResolvedValue(true);
  reads.actionableAt.mockRejectedValue(new Error('actionableAt reverted'));
  reads.previewDeposit.mockResolvedValue([988833n, 186094146378484n, 490000n]);
  reads.previewWithdraw.mockResolvedValue([1n, 1n]);
  reads.isCalm.mockResolvedValue(true);
  reads.balances.mockResolvedValue([0n, 0n]);
  reads.totalSupply.mockResolvedValue(0n);
});

describe('Aero block-based action lock', () => {
  it.each(strategies)(
    'quotes a first deposit for %s without the timestamp helper',
    async address => {
      const quote = await pool('arc', address).previewDeposit(
        new BigNumber('0.000186094146378484'),
        new BigNumber('0.49')
      );
      expect(quote.liquidity.toString()).toBe('988833');
      expect(quote.actionableAt).toBe(0n);
      expect(reads.actionable).toHaveBeenCalledOnce();
      expect(reads.actionableAt).not.toHaveBeenCalled();
    }
  );

  it('also uses the block guard for withdrawal quotes', async () => {
    await pool().previewWithdraw(new BigNumber(1));
    expect(reads.actionable).toHaveBeenCalledOnce();
    expect(reads.actionableAt).not.toHaveBeenCalled();
  });

  it('rejects both quotes while the gauge lock is active', async () => {
    reads.actionable.mockResolvedValue(false);
    await expect(pool().previewDeposit(new BigNumber(1), new BigNumber(1))).rejects.toThrow(
      'gauge lock is still active'
    );
    await expect(pool().previewWithdraw(new BigNumber(1))).rejects.toThrow(
      'gauge lock is still active'
    );
  });

  it('does not treat a failed block-lock read as unlocked', async () => {
    reads.actionable.mockRejectedValue(new Error('RPC failed'));
    await expect(pool().previewWithdraw(new BigNumber(1))).rejects.toThrow('RPC failed');
  });

  it('preserves timestamp checks for other strategies and chains', async () => {
    await expect(pool('base').previewWithdraw(new BigNumber(1))).rejects.toThrow(
      'actionableAt reverted'
    );
    await expect(pool('arc', 'another-strategy').previewWithdraw(new BigNumber(1))).rejects.toThrow(
      'actionableAt reverted'
    );
    expect(reads.actionable).not.toHaveBeenCalled();
  });
});
