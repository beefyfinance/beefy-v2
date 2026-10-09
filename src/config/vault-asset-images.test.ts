import { addressBook } from '@beefyfinance/blockchain-addressbook';
import { describe, expect, it } from 'vitest';
import type { VaultConfig } from '../features/data/apis/config-types.ts';
import type { ChainEntity } from '../features/data/entities/chain.ts';
import { singleAssetExists, singleAssetKeys } from '../helpers/singleAssetSrc.ts';

const vaultsByPath = import.meta.glob<VaultConfig[]>('./vault/*.json', {
  import: 'default',
  eager: true,
});

function findAssetsWithoutImages(): string[] {
  const missing: string[] = [];

  for (const [path, vaults] of Object.entries(vaultsByPath)) {
    const chainId = path.replace('./vault/', '').replace('.json', '') as ChainEntity['id'];
    const addressBookChainId = chainId === 'harmony' ? 'one' : chainId;
    const tokens = addressBook[addressBookChainId as keyof typeof addressBook].tokens;

    for (const vault of vaults) {
      if (vault.status === 'eol') {
        continue;
      }

      for (const assetId of vault.assets ?? []) {
        const token = tokens[assetId];
        if (!token) {
          continue;
        }

        const asset = { id: assetId, symbol: token.symbol, chainId };
        if (!singleAssetExists(asset)) {
          missing.push(`${vault.id}: ${assetId} (${singleAssetKeys(asset).join(', ')})`);
        }
      }
    }
  }

  return missing;
}

describe('vault config', () => {
  it('has an image for every asset of a non-eol vault', () => {
    expect(findAssetsWithoutImages()).toEqual([]);
  });
});
