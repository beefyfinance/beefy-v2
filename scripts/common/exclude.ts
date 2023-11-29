import { keccak256 } from '@ethersproject/solidity';
import { addressBookToAppId } from './config';

export async function getVaultsIntegrity(chainId: string) {
  try {
    const appChainId = addressBookToAppId(chainId);
    const vaults = (await import(`../../src/config/vault/${appChainId}.json`)).default as {
      earnContractAddress: string;
    }[];
    const addresses = vaults.map(vault => vault.earnContractAddress);
    const hash = keccak256(
      addresses.map(() => 'address'),
      addresses.sort()
    );
    return {
      count: addresses.length,
      hash,
    };
  } catch (e) {
    throw new Error(`Failed to get vaults integrity for chain ${chainId}: ${e.message}`);
  }
}
