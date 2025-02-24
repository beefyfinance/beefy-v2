import { appToAddressBookId, getVaultsForChain } from './common/config';
import { saveJson } from './common/files';
import { allChainIds, AppChainId } from './common/chains';
import { sortVaultKeys } from './common/vault-fields';
import { Abi, Address, getContract } from 'viem';
import { getViemClient } from './common/viem';

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
  const abChain = appToAddressBookId(chainId);
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
  const decimalsByAddress = await fetchDecimalsForTokens(
    vaults.filter(vault => !!vault.tokenAddress).map(vault => vault.tokenAddress!),
    chainId
  );

  return Promise.all(
    vaults.map(async vault => {
      if (vault.tokenAddress) {
        const existing = vault.tokenDecimals;
        const expected = decimalsByAddress[vault.tokenAddress.toLowerCase()];

        if (existing !== expected) {
          console.log(
            `Changing tokenDecimals of vault ${vault.id} on ${vault.network} from ${existing} to ${expected}...`
          );
          vault = { ...vault, tokenDecimals: expected };
        }
      }

      return sortVaultKeys(vault);
    })
  );
}

async function start() {
  const modified = await Promise.all(allChainIds.map(getModifiedConfig));

  for (let i = 0; i < allChainIds.length; i++) {
    await saveJson(`./src/config/vault/${allChainIds[i]}.json`, modified[i], true);
  }
}

start().catch(e => {
  console.error(e);
  process.exit(1);
});
