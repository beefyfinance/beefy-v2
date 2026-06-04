import type { VaultEntity } from '../entities/vault.ts';

/**
 * State containing the list of vault ids that are currently featured.
 * Loaded from `src/config/featured-vaults.json`.
 */
export type FeaturedVaultsState = {
  vaultIds: VaultEntity['id'][];
};
