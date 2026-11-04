import { getAddress, parseAbi } from 'viem';
import type { VaultConfig } from '../src/features/data/apis/config-types.ts';
import { addressBookToAppId, getChain } from './common/config.ts';
import { loadJson, saveJson } from './common/files.ts';
import { getViemClient } from './common/viem.ts';

const abi = parseAbi([
  'function want() view returns (address)',
  'function vault() view returns (address)',
  'function strategy() view returns (address)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function stable() view returns (bool)',
]);

async function main() {
  const [chainArg, addressArg, ...extra] = process.argv.slice(2);
  if (!chainArg || !addressArg || extra.length) {
    throw new Error('Usage: npm run add:aerov2 <chain> <strategy-or-vault-address>');
  }
  const chain = addressBookToAppId(chainArg);
  getChain(chain);
  const address = getAddress(addressArg);
  const path = `./src/config/vault/${chain}.json`;
  const vaults = await loadJson<VaultConfig[]>(path);
  const client = getViemClient(chain);
  const want = await client.readContract({ address, abi, functionName: 'want' });

  // A vault exposes symbol(); a strategy exposes vault(). Both expose want().
  let vaultAddress = address;
  let strategyAddress = address;
  let earnedToken: string;
  try {
    earnedToken = await client.readContract({ address, abi, functionName: 'symbol' });
    strategyAddress = await client.readContract({ address, abi, functionName: 'strategy' });
  } catch {
    vaultAddress = await client.readContract({ address, abi, functionName: 'vault' });
    const [vaultWant, symbol] = await Promise.all([
      client.readContract({ address: vaultAddress, abi, functionName: 'want' }),
      client.readContract({ address: vaultAddress, abi, functionName: 'symbol' }),
    ]);
    if (getAddress(vaultWant) !== getAddress(want))
      throw new Error('Strategy and vault want tokens differ');
    earnedToken = symbol;
  }

  const [token0, token1, stable, decimals] = await Promise.all([
    client.readContract({ address: want, abi, functionName: 'token0' }),
    client.readContract({ address: want, abi, functionName: 'token1' }),
    client.readContract({ address: strategyAddress, abi, functionName: 'stable' }),
    client.readContract({ address: want, abi, functionName: 'decimals' }),
  ]);
  const assets = await Promise.all(
    [token0, token1].map(address => client.readContract({ address, abi, functionName: 'symbol' }))
  );
  const id = `aero-v2-${chain}-${assets.join('-')}`.toLowerCase();
  const name = `${assets.join('-')} ${stable ? 's' : 'v'}LP V2`;
  const existing = vaults.find(
    vault =>
      vault.id === id || vault.earnContractAddress.toLowerCase() === vaultAddress.toLowerCase()
  );
  if (existing) {
    throw new Error(
      `Vault ${existing.id} (${existing.earnContractAddress}) already exists in ${path}; requested vault is ${vaultAddress}. Resolve the duplicate before adding it.`
    );
  }

  const vault: VaultConfig = {
    id,
    name,
    type: 'standard',
    token: name,
    tokenAddress: want,
    tokenDecimals: decimals,
    tokenProviderId: 'aero',
    earnContractAddress: vaultAddress,
    earnedToken,
    earnedTokenAddress: vaultAddress,
    oracle: 'lps',
    oracleId: id,
    status: 'active',
    createdAt: Math.floor(Date.now() / 1000),
    platformId: 'aero',
    assets,
    risks: {
      complex: false,
      curated: false,
      notAudited: false,
      notBattleTested: false,
      notCorrelated: false,
      notTimelocked: false,
      notVerified: false,
      synthAsset: false,
    },
    strategyTypeId: 'lp',
    network: chain,
  };
  await saveJson(path, [vault, ...vaults], 'prettier');
  console.log(
    `Added ${id} to ${path}. Review the risk flags and createdAt before using this config.`
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
