import type { Location, To } from 'react-router';
import type { ChainEntity } from '../features/data/entities/chain.ts';
import type { VaultEntity } from '../features/data/entities/vault.ts';

/**
 * Swaps only the vault id segment so the matched route (with/without network prefix),
 * query string (feature flags) and hash are preserved
 */
export function replaceVaultIdInUrl(
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
  vaultId: VaultEntity['id']
): To {
  return {
    pathname: location.pathname.replace(/\/vault\/[^/]+/, `/vault/${vaultId}`),
    search: location.search,
    hash: location.hash,
  };
}

export function explorerTokenUrl(chain: ChainEntity, tokenAddress: string) {
  return chain.explorerTokenUrlTemplate.replace('{address}', tokenAddress);
}

export function explorerAddressUrl(chain: ChainEntity, address: string) {
  return chain.explorerAddressUrlTemplate.replace('{address}', address);
}

export function explorerTxUrl(chain: ChainEntity, txHash: string) {
  return chain.explorerTxUrlTemplate.replace('{hash}', txHash);
}
