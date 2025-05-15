import { sortBy } from 'lodash-es';
import { getUnixNow } from '../../../helpers/date.ts';
import type { VaultConfig } from '../apis/config-types.ts';
import { getPromosApi } from '../apis/promos/promos.ts';
import type { PinnedConfig, PinnedConfigCondition, PromoConfig } from '../apis/promos/types.ts';
import type { PromoCampaignEntity, PromoEntity, PromoPartnerEntity } from '../entities/promo.ts';
import { selectVaultCurrentBoostId } from '../selectors/boosts.ts';
import { selectVaultIsBoostedForFilter } from '../selectors/filtered-vaults.ts';
import { selectVaultHasActiveOffchainCampaigns } from '../selectors/rewards.ts';
import { selectAllVisibleVaultIds, selectVaultsPinnedConfigs } from '../selectors/vaults.ts';
import type { BeefyState } from '../store/types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type FulfilledInitPromosPayload = {
  promos: PromoEntity[];
  partners: PromoPartnerEntity[];
  campaigns: PromoCampaignEntity[];
  pinned: PinnedConfig[];
};

function defaultTagText(promo: PromoConfig) {
  switch (promo.type) {
    case 'boost':
    case 'pool':
    case 'offchain':
    case 'airdrop':
      return 'Boost';
    default:
      // @ts-expect-error
      throw new Error(`Unknown promo type: ${promo.type}`);
  }
}

function defaultTagIcon(promo: PromoConfig) {
  switch (promo.type) {
    case 'boost':
    case 'pool':
    case 'offchain':
    case 'airdrop':
      return undefined;
    default:
      // @ts-expect-error
      throw new Error(`Unknown promo type: ${promo.type}`);
  }
}

export const initPromos = createAppAsyncThunk<FulfilledInitPromosPayload>(
  'promos/init',
  async () => {
    const api = await getPromosApi();
    const [promosWithChain, partnersById, campaignsById, pinned] = await Promise.all([
      api.fetchAllPromos(),
      api.fetchPartners(),
      api.fetchCampaigns(),
      api.fetchPinned(),
    ]);

    const promos: PromoEntity[] = promosWithChain.flatMap(({ chainId, promos }) =>
      promos.map(promo => {
        const tag = {
          text: promo.tag?.text || defaultTagText(promo),
          icon: promo.tag?.icon || defaultTagIcon(promo),
        };

        const campaign = promo.campaign && campaignsById[promo.campaign];
        if (campaign) {
          if (campaign?.tag?.text) {
            tag.text = campaign.tag.text;
          }
          if (campaign?.tag?.icon) {
            tag.icon = campaign.tag.icon;
          }
        } else if (promo.campaign && !campaign) {
          console.warn(`Campaign ${promo.campaign} not found for promo ${promo.id}`);
        }

        const rewards = promo.rewards.map(reward => ({
          ...reward,
          chainId: reward.chainId || chainId,
          oracle: reward.oracle || 'tokens',
        }));

        const promoPartners =
          promo.partners ?
            promo.partners.filter(partner => {
              const exists = !!partnersById[partner];
              if (!exists) {
                console.warn(`Partner ${partner} not found for promo ${promo.id}`);
              }
              return exists;
            })
          : undefined;

        const entity = {
          ...promo,
          by: promo.by || promo.title,
          chainId,
          tag,
          rewards,
          campaign: campaign ? promo.campaign : undefined,
          partners: promoPartners && promoPartners.length ? promoPartners : undefined,
          status: promo.status || 'inactive',
        };

        if (entity.type === 'boost') {
          const version = entity.version || 1;
          if (version === 1 && rewards.length !== 1) {
            throw new Error(`Boost promo ${entity.id} has ${rewards.length} rewards, expected 1`);
          } else if (rewards.length === 0) {
            throw new Error(`Boost promo ${entity.id} has no rewards, expected 1+`);
          }

          return {
            ...entity,
            version: entity.version || 1,
          };
        }

        return entity;
      })
    );

    return {
      promos,
      partners: Object.entries(partnersById).map(([id, partner]) => ({ ...partner, id })),
      campaigns: Object.entries(campaignsById).map(([id, campaign]) => ({
        ...campaign,
        id,
        tag: { text: campaign.tag?.text || undefined, icon: campaign.tag?.icon || undefined },
      })),
      pinned,
    } satisfies FulfilledInitPromosPayload;
  }
);
type FulfilledVaultsPinnedPayload = {
  byId: { [vaultId: VaultConfig['id']]: boolean };
};

function selectVaultMatchesCondition(
  state: BeefyState,
  vaultId: string,
  condition: PinnedConfigCondition
) {
  switch (condition.type) {
    case 'boosted': {
      if (selectVaultIsBoostedForFilter(state, vaultId)) {
        if (!condition.only) {
          // default: no further checks
          return true;
        } else if (condition.only === 'contract') {
          // only if boosted via traditional boost contract/config
          const boostId = selectVaultCurrentBoostId(state, vaultId);
          if (boostId) {
            return true;
          }
        } else if (condition.only === 'offchain') {
          // only if there is an offchain campaign (e.g. merkl)
          const hasOffchainCampaign = selectVaultHasActiveOffchainCampaigns(state, vaultId);
          if (hasOffchainCampaign) {
            return true;
          }
        }
      }
      return false;
    }
    case 'time': {
      const now = getUnixNow();
      if (condition.from && now < condition.from) {
        return false;
      }
      if (condition.to && now > condition.to) {
        return false;
      }
      return true;
    }
    default: {
      // @ts-expect-error when all cases are covered
      throw new Error(`Unknown pinned condition type ${condition.type}`);
    }
  }
}

function selectVaultMatchesAllConditions(
  state: BeefyState,
  vaultId: string,
  conditions: PinnedConfigCondition[]
) {
  return conditions.every(condition => selectVaultMatchesCondition(state, vaultId, condition));
}

function selectVaultMatchesAnyCondition(
  state: BeefyState,
  vaultId: string,
  conditions: PinnedConfigCondition[]
) {
  return conditions.some(condition => selectVaultMatchesCondition(state, vaultId, condition));
}

function makePRNG(seed: number) {
  // SplitMix32
  return function () {
    seed |= 0;
    seed = (seed + 0x9e3779b9) | 0;
    let num = seed ^ (seed >>> 16);
    num = Math.imul(num, 0x21f0aaad);
    num = num ^ (num >>> 15);
    num = Math.imul(num, 0x735a2d97);
    return ((num = num ^ (num >>> 15)) >>> 0) / 4294967296;
  };
}

function limitIds(ids: string[], limit: number | undefined, periodSeconds: number = 21600) {
  if (limit === undefined) {
    return ids;
  }
  if (limit < 1) {
    return [];
  }
  if (ids.length <= limit) {
    return ids;
  }

  ids.sort();
  const rng = makePRNG(Math.floor(Date.now() / (periodSeconds * 1000)));
  const sorted = sortBy(ids, () => rng());
  return sorted.slice(0, limit);
}

export const promosRecalculatePinned = createAppAsyncThunk<FulfilledVaultsPinnedPayload, void>(
  'promos/recalculate-pinned',
  async (_, { getState }) => {
    const state = getState();
    const configs = selectVaultsPinnedConfigs(state);
    const byId: Record<string, boolean> = {};
    const allVaultIds = selectAllVisibleVaultIds(state);

    for (const config of configs) {
      const ids =
        config.id ?
          (Array.isArray(config.id) ? config.id : [config.id]).filter(id =>
            allVaultIds.includes(id)
          )
        : allVaultIds;
      if (!ids.length) {
        console.warn(`No active vaults found for pinned config`, config);
        continue;
      }
      const matching = new Set<string>();
      const mode = config.mode || 'all';

      for (const id of ids) {
        // already pinned by another condition
        if (byId[id]) {
          continue;
        }
        // condition-less pin
        if (!config.conditions) {
          byId[id] = true;
          continue;
        }
        // pin if all/any conditions are met
        if (
          (mode === 'all' && selectVaultMatchesAllConditions(state, id, config.conditions)) ||
          (mode === 'any' && selectVaultMatchesAnyCondition(state, id, config.conditions))
        ) {
          matching.add(id);
        }
      }

      const limited = limitIds(Array.from(matching), config.limit);
      for (const id of limited) {
        byId[id] = true;
      }
    }

    return { byId };
  }
);
