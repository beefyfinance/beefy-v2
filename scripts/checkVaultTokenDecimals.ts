import { appToAddressBookId, chainRpcs, getVaultsForChain } from './common/config';
import { saveJson } from './common/utils';
import { allChainIds, AppChainId } from './common/chains';
import { sortVaultKeys } from './common/vault-fields';
import { MultiCall } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

const decimalsAbi: AbiItem[] = [
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
];

async function fetchDecimalsForTokens(
  tokenAddresses: string[],
  chainId: AppChainId
): Promise<Record<string, number>> {
  const uniqAddresses = Array.from(new Set(tokenAddresses.map(a => a.toLowerCase())));
  const abChain = appToAddressBookId(chainId);
  const web3 = new Web3(chainRpcs[abChain]);
  const multicall = new MultiCall(web3, addressBook[abChain].platforms.beefyfinance.multicall);
  const [results] = await multicall.all([
    uniqAddresses.map(address => {
      const contract = new web3.eth.Contract(decimalsAbi, address);
      return {
        address: address,
        decimals: contract.methods.decimals(),
      };
    }),
  ]);

  return Object.fromEntries(results.map(({ address, decimals }) => [address, parseInt(decimals)]));
}

async function getModifiedConfig(chainId: AppChainId) {
  const vaults = await getVaultsForChain(chainId);
  const decimalsByAddress = await fetchDecimalsForTokens(
    vaults.filter(vault => !!vault.tokenAddress).map(vault => vault.tokenAddress),
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
