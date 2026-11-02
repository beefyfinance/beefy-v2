import { addressBook } from '@beefyfinance/blockchain-addressbook';
import { describe, expect, it } from 'vitest';
import type { VaultConfig } from '../features/data/apis/config-types.ts';
import type { ChainEntity } from '../features/data/entities/chain.ts';
import { singleAssetExists, singleAssetKeys } from '../helpers/singleAssetSrc.ts';

const vaultsByPath = import.meta.glob<VaultConfig[]>('./vault/*.json', {
  import: 'default',
  eager: true,
});

const chains = Object.entries(vaultsByPath).map(([path, vaults]) => {
  const chainId = path.replace('./vault/', '').replace('.json', '') as ChainEntity['id'];
  const addressBookChainId = chainId === 'harmony' ? 'one' : chainId;
  const addressBookChain = addressBook[addressBookChainId as keyof typeof addressBook];
  const tokensByAddress = new Map(
    Object.values(addressBookChain.tokens).map(token => [token.address.toLowerCase(), token])
  );
  return { chainId, addressBookChain, tokensByAddress, vaults };
});

function findAssetsWithoutImages(): string[] {
  const missing: string[] = [];

  for (const { chainId, addressBookChain, vaults } of chains) {
    for (const vault of vaults) {
      if (vault.status === 'eol') {
        continue;
      }

      for (const assetId of vault.assets ?? []) {
        const token = addressBookChain.tokens[assetId];
        if (!token) {
          missing.push(`${vault.id}: ${assetId} (not in addressbook)`);
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

function findGovEarnedTokensNotInAddressBook(): string[] {
  const missing: string[] = [];

  for (const { tokensByAddress, vaults } of chains) {
    for (const vault of vaults) {
      if (vault.type !== 'gov') {
        continue;
      }

      const earnedTokenAddresses =
        vault.earnedTokenAddresses ?? (vault.earnedTokenAddress ? [vault.earnedTokenAddress] : []);
      for (const address of earnedTokenAddresses) {
        if (!tokensByAddress.has(address.toLowerCase())) {
          missing.push(`${vault.id}: ${address}`);
        }
      }
    }
  }

  return missing;
}

function findClmDepositTokensNotInAddressBook(): string[] {
  const missing: string[] = [];

  for (const { tokensByAddress, vaults } of chains) {
    for (const vault of vaults) {
      if (vault.type !== 'cowcentrated') {
        continue;
      }

      for (const address of vault.depositTokenAddresses ?? []) {
        if (!tokensByAddress.has(address.toLowerCase())) {
          missing.push(`${vault.id}: ${address}`);
        }
      }
    }
  }

  return missing;
}

function findDepositTokensNotMatchingAddressBook(): string[] {
  const mismatches: string[] = [];

  for (const { addressBookChain, tokensByAddress, vaults } of chains) {
    const { WNATIVE } = addressBookChain.tokens;
    const wnativeOracleIds = [WNATIVE.oracleId, addressBookChain.native.oracleId];

    for (const vault of vaults) {
      const token = vault.tokenAddress && tokensByAddress.get(vault.tokenAddress.toLowerCase());
      if (!token) {
        continue;
      }

      if (vault.tokenDecimals !== token.decimals) {
        mismatches.push(
          `${vault.id}: tokenDecimals ${vault.tokenDecimals} != ${token.decimals} for ${vault.token} (addressbook ${token.symbol})`
        );
      }

      if (
        vault.oracleId !== token.oracleId &&
        !(token.address === WNATIVE.address && wnativeOracleIds.includes(vault.oracleId))
      ) {
        mismatches.push(`${vault.id}: oracleId ${vault.oracleId} != ${token.oracleId}`);
      }
    }
  }

  return mismatches;
}

describe('vault config', () => {
  it('has an image for every asset of a non-eol vault', () => {
    expect(findAssetsWithoutImages()).toEqual([]);
  });

  it('has every earned token of a gov vault in the addressbook', () => {
    expect(findGovEarnedTokensNotInAddressBook()).toEqual([]);
  });

  it('has every deposit token of a CLM in the addressbook', () => {
    expect(findClmDepositTokensNotInAddressBook()).toEqual([]);
  });

  it('has deposit token decimals and oracleId matching the addressbook', () => {
    expect(findDepositTokensNotMatchingAddressBook()).toEqual([]);
  });
});
