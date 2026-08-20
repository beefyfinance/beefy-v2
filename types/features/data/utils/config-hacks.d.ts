import type { ChainId } from '../entities/chain';
import type { TokenErc20 } from '../entities/token';
import type { BoostConfig, VaultConfig } from '../apis/config-types';
export declare function getBoostTokenIdFromLegacyConfig(apiBoost: BoostConfig): string;
export declare function getBoostTokenAddressFromLegacyConfig(apiBoost: BoostConfig): string;
/**
 * Get the deposit token from a legacy vault config if it is an ERC20
 * @dev we do not need to native token as it will be added to state from the chain config
 */
export declare function getDepositTokenFromLegacyVaultConfig(chainId: ChainId, vaultConfig: VaultConfig): TokenErc20 | undefined;
