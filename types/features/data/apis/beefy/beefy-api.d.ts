import type { TreasuryConfig } from '../config-types';
import type { AllCowcentratedVaultRangesResponse, ApyFeeData, BeefyAPIApyBreakdownResponse, BeefyAPILpBreakdownResponse, BeefyAPITokenPricesResponse, BeefyApiVaultLastHarvestResponse, BeefyLastArticleResponse, BeefyOffChainRewardsCampaign, BeefySnapshotActiveResponse, ZapAggregatorTokenSupportResponse } from './beefy-api-types';
export declare const API_URL: any;
export declare const API_ZAP_URL: any;
export declare class BeefyAPI {
    api: string;
    zapApi: string;
    timeout: number;
    constructor();
    getPrices(): Promise<BeefyAPITokenPricesResponse>;
    getLPs(): Promise<BeefyAPITokenPricesResponse>;
    getLpsBreakdown(): Promise<BeefyAPILpBreakdownResponse>;
    getApyBreakdown(): Promise<BeefyAPIApyBreakdownResponse>;
    /**
     * For now we fetch lastHarvest from the api
     * TODO: fetch this from the contract directly
     */
    getVaultLastHarvest(): Promise<BeefyApiVaultLastHarvestResponse>;
    getFees(): Promise<ApyFeeData>;
    getZapAggregatorTokenSupport(): Promise<ZapAggregatorTokenSupportResponse>;
    getTreasury(): Promise<TreasuryConfig>;
    getActiveProposals(): Promise<BeefySnapshotActiveResponse>;
    getArticles(): Promise<BeefyLastArticleResponse>;
    getAllCowcentratedVaultRanges(): Promise<AllCowcentratedVaultRangesResponse>;
    getOffChainRewardCampaigns(): Promise<BeefyOffChainRewardsCampaign[]>;
}
