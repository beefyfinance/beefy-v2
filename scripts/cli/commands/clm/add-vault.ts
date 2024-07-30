import { confirm } from '@inquirer/prompts';
import { getUnixTime } from 'date-fns';
import { getAddress, getContract } from 'viem';
import type { Command } from '../../types';
import { addressBookToAppId, appToAddressBookId } from '../../../common/config';
import { getRpcClient } from '../../utils/rpc';
import type { VaultConfig } from '../../../../src/features/data/apis/config-types';
import { addVault, getVault } from '../../lib/config/vault';
import { sortVaultKeys } from '../../../common/vault-fields';
import { vaultAbi } from './vault/vaultAbi';
import { pConsole, theme } from '../../utils/console';
import { envBoolean } from '../../utils/env';

export type CommandArgs = {
  address: string;
  chain: string;
  id?: string;
  dryRun?: boolean;
};

const command: Command<CommandArgs> = {
  args: {
    address: {
      type: String,
      alias: 'a',
      description: 'CLM Vault Address (earnContractAddress)',
    },
    chain: {
      type: String,
      alias: 'c',
      description: 'CLM Vault Chain (network)',
    },
    id: {
      optional: true,
      type: String,
      alias: 'i',
      description: 'CLM Vault ID (id)',
    },
    dryRun: {
      optional: true,
      type: Boolean,
      description: 'Do not write the modified config file',
    },
  },
  description: 'Add a CLM Vault',
  run: async (args: CommandArgs) => {
    await addVaultCommand(args);
  },
};

export async function addVaultCommand(args: CommandArgs) {
  let added = false;
  const chainId = appToAddressBookId(args.chain);
  const address = getAddress(args.address);
  const existingVault = await getVault({
    network: addressBookToAppId(chainId),
    earnContractAddress: address,
  });
  if (existingVault) {
    if (args.dryRun) {
      pConsole.error(
        `${theme.bold('Dry run:')} Would have failed as CLM Vault with that address already exists`
      );
    } else {
      throw new Error(`CLM Vault already exists: ${existingVault.id}`);
    }
  }

  const client = getRpcClient(chainId);
  const vaultContract = getContract({
    client,
    address,
    abi: vaultAbi,
  });
  const [wantTokenAddress, receiptName, receiptSymbol] = await Promise.all([
    vaultContract.read.want(),
    vaultContract.read.name(),
    vaultContract.read.symbol(),
  ]);
  const clm = await getVault({
    network: addressBookToAppId(chainId),
    earnContractAddress: wantTokenAddress,
  });
  if (!clm || clm.type !== 'cowcentrated') {
    throw new Error(`No cowcentrated vault config found for want: ${wantTokenAddress}`);
  }

  const vault: VaultConfig = {
    id: `${clm.id}-vault`,
    name: clm.name,
    type: 'standard',
    token: clm.token,
    tokenAddress: clm.earnContractAddress,
    tokenDecimals: 18,
    tokenProviderId: clm.tokenProviderId,
    earnedToken: receiptSymbol,
    earnedTokenAddress: address,
    earnContractAddress: address,
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
        strategyId: 'vault-composer',
      },
      {
        strategyId: 'reward-pool-to-vault',
      },
    ],
  };

  if (clm.earningPoints) {
    clm.earningPoints = true;
  }

  console.log(sortVaultKeys(vault));
  if (
    envBoolean('CLI_CLM_TEST', false) ||
    (await confirm({ message: 'Add this CLM Vault?', default: true }))
  ) {
    if (args.dryRun) {
      if (await getVault(vault)) {
        pConsole.error(
          `${theme.bold('Dry run:')} Would have failed to add as CLM Vault already exists`
        );
      } else {
        pConsole.info(`${theme.bold('Dry run:')} Would have added CLM Vault`);
        added = true;
      }
    } else {
      await addVault(vault);
      added = true;
    }
  }

  return {
    vault,
    added,
  };
}

export default command;
