import { ArgumentConfig, parse } from 'ts-command-line-args';
import { AppChainId, appToAddressBookId, getChain, getVaultsForChain } from './common/config';
import { sortVaultKeys } from './common/vault-fields';
import { VaultConfig } from '../src/features/data/apis/config-types';
import { addressBook } from 'blockchain-addressbook';
import chunk from 'lodash/chunk';
import { BeefyV2AppMulticallAbi } from '../src/config/abi/BeefyV2AppMulticallAbi';
import BigNumber from 'bignumber.js';
import { saveJson } from './common/files';
import { getViemClient } from './common/viem';
import { Address, getContract } from 'viem';

type RunArgs = {
  help?: boolean;
  chain: string;
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
};

function getRunArgs() {
  return parse<RunArgs>(runArgsConfig, {
    helpArg: 'help',
    headerContentSections: [
      {
        header: 'yarn updateRewardPoolRewards',
        content: `Set `,
      },
    ],
  });
}

type PoolData = { vault: string; rewardPool: string };

function isDefined<T>(value: T): value is Exclude<T, undefined | null> {
  return value !== undefined && value !== null;
}

async function fetchActiveRewards(appChainId: string, configs: VaultConfig[]) {
  const now = Math.floor(Date.now() / 1000);
  const chain = getChain(appChainId);
  const abChainId = appToAddressBookId(appChainId);
  const addresses = configs.map(c => c.earnContractAddress);
  const viemClient = getViemClient(appChainId as AppChainId);
  const appMulticallContract = getContract({
    abi: BeefyV2AppMulticallAbi,
    address: chain.appMulticallContractAddress as Address,
    client: viemClient,
  });

  const results = (
    await Promise.all(
      chunk(addresses, 200).map(chunk =>
        appMulticallContract.read.getGovVaultMultiInfo([chunk as Address[]])
      )
    )
  ).flat();

  return results.map((result, i) => {
    const config = configs[i];
    return result.rewards
      .filter(({ rewardAddress, rate, periodFinish }) => {
        const token = addressBook[abChainId].tokenAddressMap[rewardAddress];
        if (!token) {
          console.warn(config.id, `${rewardAddress} not found in ${abChainId} address book`);
          return false;
        }

        const periodFinishNumber = Number(periodFinish);
        if (periodFinish <= now) {
          console.warn(
            config.id,
            `${token.symbol} periodFinish ${periodFinishNumber} (${new Date(
              periodFinishNumber * 1000
            )}) has past`
          );
          return false;
        }

        const rewardRate = new BigNumber(rate.toString(10));
        if (rewardRate.lte(0)) {
          console.warn(config.id, `${token.symbol} rewardRate is zero`);
          return false;
        }

        return true;
      })
      .map(({ rewardAddress }) => rewardAddress);
  });
}

async function main() {
  const args = getRunArgs();
  if (args.help) {
    console.log(args);
    return;
  }

  const allVaults = await getVaultsForChain(args.chain);
  const govVaults = allVaults.filter(v => v.type === 'gov' && (v.version || 1) >= 2);
  const activeRewards = await fetchActiveRewards(args.chain, govVaults);
  const isGov = new Map(govVaults.map((v, i) => [v.id, activeRewards[i]]));
  const idsModified = new Set<string>();

  const modified = allVaults.map(pool => {
    const rewards = isGov.get(pool.id);
    if (!rewards) {
      return sortVaultKeys(pool);
    }

    const existing = pool.earnedTokenAddresses || [];
    if (existing.length === rewards.length && rewards.every(r => existing.includes(r))) {
      return sortVaultKeys(pool);
    }

    idsModified.add(pool.id);
    return sortVaultKeys({
      ...pool,
      earnedTokenAddresses: rewards,
    });
  });

  if (idsModified.size > 0) {
    await saveJson(`./src/config/vault/${args.chain}.json`, modified, 'prettier');
    console.log(`[INFO] ${idsModified.size}/${isGov.size} v2 gov vaults updated`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
