import { ArgumentConfig, parse } from 'ts-command-line-args';
import { appToAddressBookId, chainRpcs, getChain, getVaultsForChain } from './common/config';
import { sortVaultKeys } from './common/vault-fields';
import { VaultConfig } from '../src/features/data/apis/config-types';
import Web3 from 'web3';
import { addressBook } from 'blockchain-addressbook';
import chunk from 'lodash/chunk';
import { BeefyV2AppMulticallAbi } from '../src/config/abi/BeefyV2AppMulticallAbi';
import type { GovVaultMultiContractDataResponse } from '../src/features/data/apis/contract-data/contract-data-types';
import type { AsWeb3Result } from '../src/features/data/utils/types-utils';
import BigNumber from 'bignumber.js';
import type { AbiItem } from 'web3-utils';
import { saveJson } from './common/files';

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
  const web3 = new Web3(chainRpcs[abChainId]);
  const mc = new web3.eth.Contract(
    BeefyV2AppMulticallAbi as unknown as AbiItem[],
    chain.appMulticallContractAddress
  );
  const results = (
    await Promise.all(
      chunk(addresses, 200).map(chunk => mc.methods.getGovVaultMultiInfo(chunk).call())
    )
  ).flat() as AsWeb3Result<GovVaultMultiContractDataResponse>[];

  return results.map((result, i) => {
    const config = configs[i];
    return result.rewards
      .filter(([address, rate, finish]) => {
        const token = addressBook[abChainId].tokenAddressMap[address];
        if (!token) {
          console.warn(config.id, `${address} not found in ${abChainId} address book`);
          return false;
        }

        const periodFinish = parseInt(finish);
        if (periodFinish <= now) {
          console.warn(
            config.id,
            `${token.symbol} periodFinish ${periodFinish} (${new Date(
              periodFinish * 1000
            )}) has past`
          );
          return false;
        }

        const rewardRate = new BigNumber(rate);
        if (rewardRate.lte(0)) {
          console.warn(config.id, `${token.symbol} rewardRate is zero`);
          return false;
        }

        return true;
      })
      .map(([address]) => address);
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
