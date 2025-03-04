import { getVaultsForChain } from './common/config.ts';
import { saveJson } from './common/files.ts';
import { allChainIds, type AppChainId } from './common/chains.ts';
import { sortVaultKeys } from './common/vault-fields.ts';
import { type Abi, type Address, getContract } from 'viem';
import { getViemClient } from './common/viem.ts';
import type { VaultConfig } from '../src/features/data/apis/config-types.ts';

const decimalsAbi = [
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

async function fetchDecimalsForTokens(
  tokenAddresses: string[],
  chainId: AppChainId
): Promise<Record<string, number>> {
  const viemClient = getViemClient(chainId);
  const uniqAddresses = Array.from(new Set(tokenAddresses.map(a => a.toLowerCase())));
  const results = await Promise.all(
    uniqAddresses.map(address => {
      const contract = getContract({
        abi: decimalsAbi,
        address: address as Address,
        client: viemClient,
      });
      return contract.read.decimals();
    })
  );

  return Object.fromEntries(results.map((decimals, i) => [uniqAddresses[i], decimals]));
}

async function getModifiedConfig(chainId: AppChainId) {
  const vaults = await getVaultsForChain(chainId);
  const checkVault = (
    vault: VaultConfig
  ): vault is Omit<VaultConfig, 'tokenAddress'> & { tokenAddress: string } =>
    !!vault.tokenAddress && vault.type !== 'cowcentrated';
  const decimalsByAddress = await fetchDecimalsForTokens(
    vaults.filter(checkVault).map(vault => vault.tokenAddress),
    chainId
  );

  return Promise.all(
    vaults.map(async vault => {
      if (!checkVault(vault)) {
        return vault;
      }
      const existing = vault.tokenDecimals;
      const expected = decimalsByAddress[vault.tokenAddress.toLowerCase()];
      if (!expected || isNaN(expected)) {
        console.error(`Failed to fetch decimals for token ${vault.tokenAddress} on ${chainId}`);
        return vault;
      }

      if (existing === expected) {
        return vault;
      }

      console.log(
        `Changing tokenDecimals of vault ${vault.id} on ${vault.network} from ${existing} to ${expected}...`
      );
      return sortVaultKeys({ ...vault, tokenDecimals: expected });
    })
  );
}

async function start() {
  const modified = await Promise.allSettled(allChainIds.map(getModifiedConfig));

  for (let i = 0; i < allChainIds.length; i++) {
    const result = modified[i];
    if (result.status === 'rejected') {
      console.error(`Failed to fetch decimals for chain ${allChainIds[i]}:`, result.reason);
      continue;
    }
    await saveJson(`./src/config/vault/${allChainIds[i]}.json`, result.value, 'prettier');
  }
}

start().catch(e => {
  console.error(e);
  process.exit(1);
});
