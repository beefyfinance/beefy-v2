import type { VaultEntity } from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
import type { TokenEntity } from '../../entities/token';
import type { KeysOfUnion } from '../../utils/types-utils';

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
};
export type ApyVaultFeeData = {
  performance: ApyPerformanceFeeData;
  withdraw: number;
  deposit?: number;
  lastUpdated: number;
};
export type ApyFeeData = Record<VaultEntity['id'], ApyVaultFeeData>;

interface ApyGovVault {
  vaultApr: number;
}

interface ApyMaxiVault {
  totalApy: number;
}

export interface ApyStandard {
  beefyPerformanceFee: number;
  vaultApr: number;
  compoundingsPerYear: number;
  vaultApy: number;
  tradingApr?: number;
  composablePoolApr?: number;
  liquidStakingApr?: number;
  totalApy: number;
  // todo: does it make sense to have fees and apy in the same entities?
  lpFee: number;
}

export interface ApyCLM {
  clmApr: number;
  totalApy: number;
  merklApr?: number;
}

type ExtractAprComponents<T extends string> = T extends `${infer C}Apr` ? C : never;
export type ApiApyData = ApyGovVault | ApyMaxiVault | ApyStandard | ApyCLM;
export type ApiApyDataKeys = KeysOfUnion<ApiApyData>;
export type ApiApyDataAprComponents = ExtractAprComponents<ApiApyDataKeys>;

export interface BeefyAPITokenPricesResponse {
  [tokenId: TokenEntity['id']]: number;
}

export interface BeefyAPIApyBreakdownResponse {
  [vaultId: VaultEntity['id']]: ApiApyData;
}

export interface LpData {
  price: number;
  tokens: string[];
  balances: string[];
  totalSupply: string;
  underlyingPrice?: number;
  underlyingBalances?: string[];
  underlyingLiquidity?: string;
}

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

export type BeefyApiMerklCampaignVault = {
  id: string;
  address: string;
  apr: number;
};

export type BeefyApiMerklCampaignRewardToken = {
  address: string;
  symbol: string;
  decimals: number;
};

export type BeefyApiMerklCampaign<TChainId extends string = ChainEntity['id']> = {
  campaignId: string;
  startTimestamp: number;
  endTimestamp: number;
  chainId: TChainId;
  poolAddress: string;
  rewardToken: BeefyApiMerklCampaignRewardToken;
  type: string;
  vaults: BeefyApiMerklCampaignVault[];
};
