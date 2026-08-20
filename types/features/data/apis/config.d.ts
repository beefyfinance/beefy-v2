import type { ChainEntity } from '../entities/chain';
import type { AmmConfig, BeefyBridgeConfig, BridgeConfig, ChainConfig, CuratorConfig, MinterConfig, PartnersConfig, PlatformConfig, SwapAggregatorConfig, VaultConfig, ZapConfig, ZapFeeRule } from './config-types';
/**
 * A class to access beefy configuration
 * Access to vaults, boosts, featured items, etc
 */
export declare class ConfigAPI {
    fetchChainConfigs(): Promise<ChainConfig[]>;
    fetchPartnersConfig(): Promise<PartnersConfig>;
    fetchZapAmms(): Promise<{
        [chainId in ChainEntity['id']]: AmmConfig[];
    }>;
    fetchBeefyBridgeConfig(): Promise<BeefyBridgeConfig>;
    fetchZapSwapAggregators(): Promise<SwapAggregatorConfig[]>;
    fetchZapConfigs(): Promise<ZapConfig[]>;
    fetchZapFeeCampaigns(): Promise<ZapFeeRule[]>;
    fetchAllVaults(): Promise<{
        [chainId in ChainEntity['id']]: VaultConfig[];
    }>;
    fetchAllMinters(): Promise<{
        [chainId in ChainEntity['id']]?: MinterConfig[];
    }>;
    fetchPlatforms(): Promise<PlatformConfig[]>;
    fetchCurators(): Promise<CuratorConfig[]>;
    fetchBridges(): Promise<BridgeConfig[]>;
    fetchFeaturedVaults(): Promise<VaultConfig['id'][]>;
}
