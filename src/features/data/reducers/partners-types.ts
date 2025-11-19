import type { VaultEntity } from '../entities/vault.ts';
import type { ChainEntity } from '../apis/chains/entity-types.ts';

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
