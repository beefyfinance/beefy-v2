import type { ChainEntity } from '../entities/chain';
import type { VaultEntity } from '../entities/vault';
/**
 * State containing Vault infos
 */
export type PartnersState = {
    qidao: {
        byVaultId: {
            [vaultId: VaultEntity['id']]: boolean;
        };
    };
    nexus: {
        byChainId: {
            [chainId in ChainEntity['id']]?: boolean;
        };
    };
};
