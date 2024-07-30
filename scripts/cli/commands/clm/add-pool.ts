import { confirm } from '@inquirer/prompts';
import { getUnixTime } from 'date-fns';
import { getAddress, getContract } from 'viem';
import type { Command } from '../../types';
import { AddressBookChainId, addressBookToAppId, appToAddressBookId } from '../../../common/config';
import { getRpcClient } from '../../utils/rpc';
import type { VaultConfig } from '../../../../src/features/data/apis/config-types';
import { addVault, getVault } from '../../lib/config/vault';
import { rewardPoolAbi } from './reward-pool/rewardPoolAbi';
import { sortVaultKeys } from '../../../common/vault-fields';
import { pConsole, theme } from '../../utils/console';
import { findVaultForClm } from './vault';
import { loadCommand } from '../../commands';
import { envBoolean } from '../../utils/env';

export type CommandArgs = {
  address: string;
  chain: string;
  id?: string;
  vault?: string;
  dryRun?: boolean;
  disableAutoFind?: boolean;
};

const command: Command<CommandArgs> = {
  args: {
    address: {
      type: String,
      alias: 'a',
      description: 'CLM Pool Address (earnContractAddress)',
    },
    chain: {
      type: String,
      alias: 'c',
      description: 'CLM Pool Chain (network)',
    },
    id: {
      optional: true,
      type: String,
      alias: 'i',
      description: 'CLM Pool ID (id)',
    },
    vault: {
      optional: true,
      type: String,
      description: 'Also add a CLM Vault using this address',
    },
    dryRun: {
      optional: true,
      type: Boolean,
      description: 'Do not write the modified config file',
    },
    disableAutoFind: {
      optional: true,
      type: Boolean,
      description: 'Disable auto finding of related pool and vault',
    },
  },
  description: 'Add a CLM Pool',
  run: async (args: CommandArgs) => {
    await addPoolCommand(args);
  },
};

export async function addPoolCommand(args: CommandArgs) {
  let added = false;
  const chainId = appToAddressBookId(args.chain);
  const address = getAddress(args.address);
  const existingPool = await getVault({
    network: addressBookToAppId(chainId),
    earnContractAddress: address,
  });
  if (existingPool) {
    if (args.dryRun) {
      pConsole.error(
        `${theme.bold('Dry run:')} Would have failed as CLM Pool with that address already exists`
      );
    } else {
      throw new Error(`CLM Pool already exists: ${existingPool.id}`);
    }
  }

  const client = getRpcClient(chainId);
  const poolContract = getContract({
    client,
    address,
    abi: rewardPoolAbi,
  });
  const [stakedTokenAddress, receiptName, receiptSymbol, rewardsLength] = await Promise.all([
    poolContract.read.stakedToken(),
    poolContract.read.name(),
    poolContract.read.symbol(),
    poolContract.read.rewardsLength(),
  ]);
  const clm = await getVault({
    network: addressBookToAppId(chainId),
    earnContractAddress: stakedTokenAddress,
  });
  if (!clm || clm.type !== 'cowcentrated') {
    throw new Error(
      `No cowcentrated config found for reward pool staked token: ${stakedTokenAddress}`
    );
  }

  const pool: VaultConfig = {
    id: args.id || `${clm.id}-rp`,
    name: `${clm.name} Reward Pool`,
    type: 'gov',
    version: 2,
    token: clm.earnedToken,
    tokenAddress: clm.earnContractAddress,
    tokenDecimals: 18,
    tokenProviderId: clm.tokenProviderId,
    earnedToken: receiptSymbol,
    earnContractAddress: address,
    earnedTokenAddresses: [],
    oracle: 'lps',
    oracleId: clm.oracleId,
    status: 'active',
    createdAt: getUnixTime(new Date()),
    platformId: clm.platformId,
    assets: clm.assets,
    risks: clm.risks,
    strategyTypeId: clm.strategyTypeId,
    network: clm.network,
    zaps: [
      {
        strategyId: 'gov-composer',
      },
      {
        strategyId: 'reward-pool-to-vault',
      },
    ],
  };

  if (clm.earningPoints) {
    clm.earningPoints = true;
  }

  console.log(sortVaultKeys(pool));
  if (
    envBoolean('CLI_CLM_TEST', false) ||
    (await confirm({ message: 'Add this CLM Pool?', default: true }))
  ) {
    if (args.dryRun) {
      if (await getVault(pool)) {
        pConsole.error(
          `${theme.bold('Dry run:')} Would have failed to add as CLM Pool already exists`
        );
      } else {
        pConsole.info(`${theme.bold('Dry run:')} Would have added CLM Pool`);
        added = true;
      }
    } else {
      await addVault(pool);
      added = true;
    }
    await maybeAddVault(
      args.vault,
      chainId,
      clm.earnContractAddress,
      args.dryRun,
      args.disableAutoFind
    );
  }

  return { pool, added };
}

async function maybeAddVault(
  vaultFromArgs: string | undefined,
  chainId: AddressBookChainId,
  clmAddress: string,
  dryRun?: boolean,
  disableAutoFind?: boolean
) {
  let vaultAddress = vaultFromArgs;

  if (!vaultAddress && !disableAutoFind) {
    const maybeVaultAddress = await findVaultForClm(chainId, clmAddress);
    if (maybeVaultAddress) {
      pConsole.info(`Found CLM Vault at: ${maybeVaultAddress}`);
      if (await confirm({ message: 'Add this CLM Vault too?', default: true })) {
        vaultAddress = maybeVaultAddress;
      }
    }
  }

  if (vaultAddress) {
    const command = await loadCommand<{ address: string; chain: string; dryRun?: boolean }>(
      'clm:add-vault'
    );
    await command.run({ address: vaultAddress, chain: chainId, dryRun });
  }
}

export default command;
