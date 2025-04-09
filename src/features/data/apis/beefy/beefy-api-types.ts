import type { VaultEntity } from '../../entities/vault.ts';
import type { ChainEntity, ChainId } from '../../entities/chain.ts';
import type { TokenEntity } from '../../entities/token.ts';
import type { KeysOfUnion, MergeObjectUnion } from '../../utils/types-utils.ts';

export type AllCowcentratedVaultRangesResponse = {
  [chainId: string]: {
    [vaultId: string]: {
      currentPrice: string;
      priceRangeMin: string;
      priceRangeMax: string;
    };
  };
};
export type ApyPerformanceFeeData = {
  total: number;
  call: number;
  strategist: number;
  treasury: number;
  stakers: number;
  liquidity?: number;
};
export type ApyVaultFeeData = {
  performance: ApyPerformanceFeeData;
  withdraw: number;
  deposit?: number;
  lastUpdated: number;
};
export type ApyFeeData = Record<VaultEntity['id'], ApyVaultFeeData>;

interface ApyGovVaultLegacy {
  vaultApr: number;
}

interface ApyGovVault {
  rewardPoolApr?: number;
  clmApr?: number;
  merklApr?: number;
  totalApy: number;
}

export interface ApyStandard {
  beefyPerformanceFee: number;
  compoundingsPerYear: number;
  vaultApr?: number;
  tradingApr?: number;
  composablePoolApr?: number;
  liquidStakingApr?: number;
  rewardPoolApr?: number;
  rewardPoolTradingApr?: number;
  totalApy: number;
}

export interface ApyCLM {
  clmApr: number;
  merklApr?: number;
  stellaSwapApr?: number;
  totalApy: number;
}

type ExtractAprComponents<T extends string> = T extends `${infer C}Apr` ? C : never;

export type ApiApyData = MergeObjectUnion<ApyGovVault | ApyGovVaultLegacy | ApyStandard | ApyCLM>;
export type ApiApyDataKeys = KeysOfUnion<ApiApyData>;
export type ApiApyDataAprComponents = ExtractAprComponents<ApiApyDataKeys>;

export interface BeefyAPITokenPricesResponse {
  [tokenId: TokenEntity['id']]: number;
}

export interface BeefyAPIApyBreakdownResponse {
  [vaultId: VaultEntity['id']]: ApiApyData;
}

export type BaseLpData = {
  price: number;
  tokens: string[];
  balances: string[];
  totalSupply: string;
};

export type CowcentratedLpData = BaseLpData & {
  underlyingPrice: number;
  underlyingBalances: string[];
  underlyingLiquidity: string;
};

export type LpData = BaseLpData | CowcentratedLpData;

export interface BeefyAPILpBreakdownResponse {
  [vaultId: VaultEntity['id']]: LpData;
}

export type BeefyApiVaultLastHarvestResponse = Record<string, number>;
export type BeefySnapshotProposal = {
  id: string;
  title: string;
  start: number;
  end: number;
  author: string;
  coreProposal: boolean;
  space: string;
  url: string;
};
export type BeefySnapshotActiveResponse = BeefySnapshotProposal[];
export type BeefyArticleConfig = {
  id: string;
  title: string;
  description: string;
  url: string;
  date: number;
};
export type BeefyLastArticleResponse = BeefyArticleConfig;
export type ZapAggregatorTokenSupportResponse = {
  [chainId in ChainEntity['id']]?: {
    [tokenAddress: TokenEntity['address']]: {
      [provider: string]: boolean;
    };
  };
};

export type BeefyOffChainRewardsProviderId = 'merkl' | 'stellaswap';

export type BeefyOffChainRewardsRewardToken = {
  address: string;
  symbol: string;
  decimals: number;
  chainId: ChainId;
};

export type BeefyOffChainRewardsVault = {
  id: string;
  address: string;
  poolAddress: string;
  /** @dev this does not match VaultEntity */
  type: 'standard' | 'gov' | 'cowcentrated' | 'cowcentrated-pool' | 'cowcentrated-vault';
  chainId: ChainId;
};

export type BeefyOffChainRewardsCampaignVault = BeefyOffChainRewardsVault & {
  apr: number;
};

export type BeefyOffChainRewardsBeefyCampaignType =
  | 'test'
  | 'arb-ltipp'
  | 'op-gov-fund'
  | 'zap-v3'
  | 'mode-grant'
  | 'other';
export type BeefyOffChainRewardsExternalCampaignType = 'external';
export type BeefyOffChainRewardsCampaignType =
  | BeefyOffChainRewardsBeefyCampaignType
  | BeefyOffChainRewardsExternalCampaignType;

type MakeCampaign<
  TProvider extends BeefyOffChainRewardsProviderId,
  TExtra extends Record<string, unknown>,
> = {
  providerId: TProvider;
  id: string;
  chainId: ChainId;
  poolAddress: string;
  rewardToken: BeefyOffChainRewardsRewardToken;
  vaults: BeefyOffChainRewardsCampaignVault[];
  type: BeefyOffChainRewardsCampaignType;
  startTimestamp: number;
  endTimestamp: number;
  active: boolean;
} & TExtra;

export type BeefyOffChainRewardsMerklCampaign = MakeCampaign<
  'merkl',
  {
    campaignId: string;
  }
>;

export type BeefyOffChainRewardsStellaSwapCampaign = MakeCampaign<
  'stellaswap',
  {
    rewardId: number;
    rewarderAddress: string;
    isPaused: boolean;
  }
>;

export type BeefyOffChainRewardsCampaign =
  | BeefyOffChainRewardsMerklCampaign
  | BeefyOffChainRewardsStellaSwapCampaign;
