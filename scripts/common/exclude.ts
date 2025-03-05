import { addressBookToAppId } from './config.ts';
import { createHash } from 'node:crypto';

export async function getVaultsIntegrity(chainId: string) {
  try {
    const appChainId = addressBookToAppId(chainId);
    const vaults = (await import(`../../src/config/vault/${appChainId}.json`)).default as {
      earnContractAddress: string;
    }[];
    const addresses = vaults.map(vault => vault.earnContractAddress).sort();
    const hasher = createHash('sha256');
    addresses.forEach(address => hasher.update(address));
    const hash = hasher.digest('hex');
    return {
      count: addresses.length,
      hash,
    };
  } catch (e) {
    throw new Error(
      `Failed to get vaults integrity for chain ${chainId}: ${e instanceof Error ? e.message : e}`
    );
  }
}
