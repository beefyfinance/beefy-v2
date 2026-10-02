import { describe, expect, it } from 'vitest';
import type { BeefyOffChainRewardsRewardToken } from '../apis/beefy/beefy-api-types.ts';
import {
  boostV1,
  makeRewardsState,
  promoReward,
  rewardBifi,
  rewardUsdc,
} from '../apis/reward-tokens.test-helper.ts';
import { erc20Token } from '../apis/transact/helpers/same-balance.test-helper.ts';
import type { PromoReward } from '../entities/promo.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { OffChainRewardsCampaign } from '../reducers/rewards-types.ts';
import type { BeefyState } from '../store/types.ts';
import {
  selectVaultActiveExtraRewardTokens,
  selectVaultCurrentBoostRewardTokens,
} from './rewards.ts';

const VAULT_ID = 'moo-usdc';

const apiToken = ({
  address,
  symbol,
  decimals,
  chainId,
}: Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'chainId'>) =>
  ({ address, symbol, decimals, chainId }) satisfies BeefyOffChainRewardsRewardToken;

const unlistedToken = erc20Token(
  'base',
  'NEW',
  'NEW',
  '0xdead00000000000000000000000000000000beef',
  18
);

function campaign(
  providerId: OffChainRewardsCampaign['providerId'],
  rewardToken: BeefyOffChainRewardsRewardToken
): OffChainRewardsCampaign {
  const now = Math.trunc(Date.now() / 1000);
  return {
    providerId,
    id: `${providerId}-${rewardToken.address}`,
    chainId: 'base',
    rewardToken,
    type: 'test',
    startTimestamp: now - 3600,
    endTimestamp: now + 3600,
    active: true,
  } as OffChainRewardsCampaign;
}

function stateWithCampaigns(campaigns: OffChainRewardsCampaign[]): BeefyState {
  const vaultAprs = (providerId: OffChainRewardsCampaign['providerId']) =>
    campaigns.filter(c => c.providerId === providerId).map(c => ({ id: c.id, apr: 0.1 }));

  return {
    ...makeRewardsState(),
    biz: {
      rewards: {
        offchain: {
          byId: Object.fromEntries(campaigns.map(c => [c.id, c])),
          byVaultId: { [VAULT_ID]: campaigns.map(c => ({ id: c.id, apr: 0.1 })) },
          byProviderId: {
            merkl: { [VAULT_ID]: vaultAprs('merkl') },
            stellaswap: { [VAULT_ID]: vaultAprs('stellaswap') },
          },
        },
      },
    },
  } as unknown as BeefyState;
}

function stateWithBoostRewards(rewards: PromoReward[]): BeefyState {
  const state = makeRewardsState();
  const boost = { ...boostV1, vaultId: VAULT_ID, rewards };

  return {
    ...state,
    entities: {
      ...state.entities,
      promos: {
        byId: { [boost.id]: boost },
        byVaultId: { [VAULT_ID]: { byType: { boost: { allIds: [boost.id] } } } },
        statusById: { [boost.id]: 'active' },
      },
    },
  } as unknown as BeefyState;
}

describe('selectVaultActiveExtraRewardTokens', () => {
  it('uses the address book token, so it keeps its id', () => {
    const state = stateWithCampaigns([
      campaign('merkl', apiToken(rewardBifi)),
      campaign('stellaswap', apiToken(rewardUsdc)),
    ]);

    expect(selectVaultActiveExtraRewardTokens(state, VAULT_ID)).toEqual([rewardBifi, rewardUsdc]);
  });

  it('falls back to the campaign token when it is not in the address book', () => {
    const state = stateWithCampaigns([campaign('merkl', apiToken(unlistedToken))]);

    expect(selectVaultActiveExtraRewardTokens(state, VAULT_ID)).toEqual([apiToken(unlistedToken)]);
  });
});

describe('selectVaultCurrentBoostRewardTokens', () => {
  it('uses the address book token, so it keeps its id and symbol', () => {
    const state = stateWithBoostRewards([
      promoReward(rewardBifi),
      { ...promoReward(rewardUsdc), symbol: 'USDCe' },
    ]);

    expect(selectVaultCurrentBoostRewardTokens(state, VAULT_ID)).toEqual([rewardBifi, rewardUsdc]);
  });

  it('falls back to the boost reward when it is not in the address book', () => {
    const reward = promoReward(unlistedToken);
    const state = stateWithBoostRewards([reward]);

    expect(selectVaultCurrentBoostRewardTokens(state, VAULT_ID)).toEqual([reward]);
  });

  it('returns the same tokens when unrelated state changes', () => {
    const state = stateWithBoostRewards([promoReward(rewardBifi)]);

    expect(selectVaultCurrentBoostRewardTokens({ ...state }, VAULT_ID)).toBe(
      selectVaultCurrentBoostRewardTokens(state, VAULT_ID)
    );
  });
});
