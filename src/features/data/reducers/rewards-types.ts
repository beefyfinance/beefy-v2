import type {
  BeefyOffChainRewardsMerklCampaign,
  BeefyOffChainRewardsStellaSwapCampaign,
} from '../apis/beefy/beefy-api-types.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { GovVaultMultiContractData } from '../apis/contract-data/contract-data-types.ts';

export type MerklRewardsCampaign = Omit<BeefyOffChainRewardsMerklCampaign, 'vaults'>;
export type StellaSwapRewardsCampaign = Omit<BeefyOffChainRewardsStellaSwapCampaign, 'vaults'>;
export type OffChainRewardsCampaign = MerklRewardsCampaign | StellaSwapRewardsCampaign;

export type VaultRewardApr = {
  id: string;
  apr: number;
};

export type GovRewardsState = {
  byVaultId: Record<VaultEntity['id'], GovVaultMultiContractData['rewards']>;
};

export type RewardsState = {
  offchain: {
    byId: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>;
    byVaultId: Record<VaultEntity['id'], VaultRewardApr[]>;
    byProviderId: {
      merkl: Record<VaultEntity['id'], VaultRewardApr[]>;
      stellaswap: Record<VaultEntity['id'], VaultRewardApr[]>;
    };
  };
  gov: GovRewardsState;
};
