import type { ChainEntity } from '../entities/chain.ts';
import type { VaultEntity } from '../entities/vault.ts';

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
