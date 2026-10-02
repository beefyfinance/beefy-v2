import { describe, expect, it, vi } from 'vitest';
import type { ChainEntity } from '../../entities/chain.ts';
import {
  boostV1,
  boostV2,
  govMulti,
  makeRewardsState,
  rewardBifi,
  rewardUsdc,
} from '../reward-tokens.test-helper.ts';
import { ContractDataAPI } from './contract-data.ts';

const { simulateLiveBoost } = vi.hoisted(() => ({ simulateLiveBoost: vi.fn(() => false) }));

vi.mock('../rpc-contract/viem-contract.ts', async () => {
  const { rewardBifi } = await import('../reward-tokens.test-helper.ts');
  return {
    fetchContract: () => ({
      read: {
        getBoostInfo: async ([addresses]: [string[]]) =>
          addresses.map(() => ({
            totalSupply: 0n,
            rewardRate: 1n,
            periodFinish: 2_000_000_000n,
            isPreStake: false,
          })),
        getGovVaultMultiInfo: async ([addresses]: [string[]]) =>
          addresses.map(() => ({
            totalSupply: 0n,
            rewards: [
              { rewardAddress: rewardBifi.address, rate: 1n, periodFinish: 2_000_000_000n },
            ],
          })),
      },
    }),
  };
});
vi.mock(import('../../utils/feature-flags.ts'), async importOriginal => ({
  ...(await importOriginal()),
  featureFlag_getContractDataApiChunkSize: () => 100,
  featureFlag_simulateLiveBoost: simulateLiveBoost,
}));

const api = new ContractDataAPI({ id: 'base', appMulticallContractAddress: '0x1' } as ChainEntity);

const rewardIds = (rewards: { token: { id: string } }[]) => rewards.map(r => r.token.id);

describe('reward tokens', () => {
  it('keep their id on gov vaults', async () => {
    const result = await api.fetchAllContractData(makeRewardsState(), {
      govVaultsMulti: [govMulti],
    });

    expect(rewardIds(result.govVaultsMulti[0].rewards)).toEqual([rewardBifi.id]);
  });

  it('keep their id on v1 boosts', async () => {
    const result = await api.fetchAllContractData(makeRewardsState(), { boosts: [boostV1] });

    expect(rewardIds(result.boosts[0].rewards)).toEqual([rewardBifi.id]);
  });

  it.each([false, true])(
    'keep their id on multi boosts, including rewards only in the config (simulate live: %s)',
    async simulateLive => {
      simulateLiveBoost.mockReturnValue(simulateLive);

      const result = await api.fetchAllContractData(makeRewardsState(), {
        boostsMulti: [boostV2],
      });

      expect(rewardIds(result.boosts[0].rewards).sort()).toEqual(
        [rewardBifi.id, rewardUsdc.id].sort()
      );
    }
  );
});
