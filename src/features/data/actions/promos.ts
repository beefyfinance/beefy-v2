import { createAsyncThunk } from '@reduxjs/toolkit';
import { getPromosApi } from '../apis/promos';
import type { PromoCampaignEntity, PromoEntity, PromoPartnerEntity } from '../entities/promo';
import type { PinnedConfig, PinnedConfigCondition, PromoConfig } from '../apis/promos/types';
import type { VaultConfig } from '../apis/config-types';
import type { BeefyState } from '../../../redux-types';
import { selectAllVisibleVaultIds, selectVaultsPinnedConfigs } from '../selectors/vaults';
import { selectVaultTotalApy } from '../selectors/apy';
import { selectVaultCurrentBoostId } from '../selectors/boosts';
import { selectVaultHasActiveOffchainCampaigns } from '../selectors/rewards';
import { getUnixNow } from '../../../helpers/date';

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

export const initPromos = createAsyncThunk<FulfilledInitPromosPayload>('promos/init', async () => {
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

      const promoPartners = promo.partners
        ? promo.partners.filter(partner => {
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
});
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
      const apy = selectVaultTotalApy(state, vaultId);
      if (!!apy && (apy.boostedTotalDaily || 0) > 0) {
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

export const promosRecalculatePinned = createAsyncThunk<
  FulfilledVaultsPinnedPayload,
  void,
  { state: BeefyState }
>('promos/recalculate-pinned', async (_, { getState }) => {
  const state = getState();
  const configs = selectVaultsPinnedConfigs(state);
  const byId: Record<string, boolean> = {};
  const allVaultIds = selectAllVisibleVaultIds(state);

  for (const config of configs) {
    const ids = config.id
      ? (Array.isArray(config.id) ? config.id : [config.id]).filter(id => allVaultIds.includes(id))
      : allVaultIds;
    if (!ids.length) {
      console.warn(`No active vaults found for pinned config`, config);
      continue;
    }

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
        byId[id] = true;
      }
    }
  }

  return { byId };
});
