import { ArgumentConfig, parse } from 'ts-command-line-args';
import { getVaultsForChain } from './common/config';
import { sortVaultKeys } from './common/vault-fields';
import { loadJson, saveJson } from './common/files';
import { VaultConfig } from '../src/features/data/apis/config-types';

type RunArgs = {
  help?: boolean;
  chain: string;
  path: string;
};

const runArgsConfig: ArgumentConfig<RunArgs> = {
  help: {
    type: Boolean,
    alias: 'h',
    description: 'Display this usage guide.',
    optional: true,
  },
  chain: {
    type: String,
    alias: 'c',
    description: 'Chain json file to process',
  },
  path: {
    type: String,
    alias: 'p',
    description: 'Path to .json file',
  },
};

function getRunArgs() {
  return parse<RunArgs>(runArgsConfig, {
    helpArg: 'help',
    headerContentSections: [
      {
        header: 'yarn addClmRewardPools',
        content: `Add reward pools for existing clms in a chain json file.
        
        Format for json file is Array<\\{ vault: Address; rewardPool: Address \\}>`,
      },
    ],
  });
}

type PoolData = { vault: string; rewardPool: string };

async function getPools(path: string): Promise<PoolData[]> {
  return loadJson(path);
}

function isDefined<T>(value: T): value is Exclude<T, undefined | null> {
  return value !== undefined && value !== null;
}

async function main() {
  const args = getRunArgs();
  if (args.help) {
    console.log(args);
    return;
  }

  const chainId = args.chain;
  const pools = await getPools(args.path);
  const notFound = new Set();
  const alreadyExists = new Set();
  const allVaults = await getVaultsForChain(args.chain);

  const poolConfigs = pools
    .map(pool => {
      const vault = allVaults.find(v => v.earnContractAddress === pool.vault);
      if (!vault) {
        notFound.add(pool.vault);
        return undefined;
      }

      const existing = allVaults.find(v => v.tokenAddress === pool.vault);
      if (existing) {
        alreadyExists.add(pool.rewardPool);
        if (existing.earnContractAddress !== pool.rewardPool) {
          console.error(
            `[ERROR/${chainId}] Reward pool "${existing.id}" with a different address ${existing.earnContractAddress} already exists for "${existing.oracleId}", was it deployed at ${pool.rewardPool} for a second time by mistake?`
          );
        }
        return undefined;
      }

      return sortVaultKeys({
        id: `${vault.id}-rp`,
        name: `${vault.name} Reward Pool`,
        type: 'gov',
        version: 2,
        token: vault.earnedToken,
        tokenAddress: vault.earnedTokenAddress,
        tokenDecimals: 18,
        tokenProviderId: vault.tokenProviderId,
        earnedToken: `r${vault.earnedToken}`,
        earnedTokenAddresses: [],
        earnContractAddress: pool.rewardPool,
        oracle: vault.oracle,
        oracleId: vault.oracleId,
        status: vault.status,
        createdAt: vault.createdAt + 1,
        platformId: vault.platformId,
        assets: vault.assets,
        risks: vault.risks,
        strategyTypeId: vault.strategyTypeId,
        network: vault.network,
        zaps: [
          {
            strategyId: 'gov-composer',
          },
        ],
      });
    })
    .filter(isDefined);

  if (notFound.size > 0) {
    console.error(`[ERROR/${chainId}] CLM ${Array.from(notFound.values()).join(', ')} not found`);
  }

  // if (alreadyExists.size > 0) {
  //   console.warn(
  //     `[WARN] CLM Pool ${Array.from(alreadyExists.values()).join(', ')} already exist on ${
  //       chain.name
  //     }`
  //   );
  // }

  if (poolConfigs.length > 0) {
    const modified = [...poolConfigs, ...allVaults];
    await saveJson(`./src/config/vault/${args.chain}.json`, modified, 'prettier');
    console.log(`[INFO/${chainId}] ${poolConfigs.length} gov vaults added`);
    checkForMissing(chainId, modified);
  } else {
    checkForMissing(chainId, allVaults);
  }
}

function checkForMissing(chainId: string, configs: VaultConfig[]) {
  for (const config of configs) {
    if (config.type !== 'cowcentrated' || config.status !== 'active') {
      continue;
    }

    const rp = configs.find(v => v.tokenAddress === config.earnContractAddress);
    if (!rp) {
      console.warn(
        `[WARN/${chainId}] No reward pool for ${config.oracleId} [${config.earnContractAddress}]`
      );
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
