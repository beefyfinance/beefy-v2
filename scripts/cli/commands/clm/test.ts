import type { Command } from '../../types';
import { AddressBookChainId, appToAddressBookId } from '../../../common/config';
import { getVaultsConfig } from '../../lib/config/vault';
import { VaultConfig } from '../../../../src/features/data/apis/config-types';
import { addClmCommand, CommandArgs as AddClmCommandArgs } from './add';
import { pConsole } from '../../utils/console';
import { confirm } from '@inquirer/prompts';
import { difference, groupBy, isEqual, sample } from 'lodash';
import { typedKeys } from '../../utils/object';
import { isDefined } from '../../utils/typeguards';

export type CommandArgs = {
  chainId: string;
  sample?: boolean;
};

const command: Command<CommandArgs> = {
  args: {
    chainId: {
      type: String,
      alias: 'c',
      description: 'Chain ID',
    },
    sample: {
      type: Boolean,
      alias: 's',
      description: 'Pick one vault per provider at random to test',
      optional: true,
    },
  },
  description: 'Test the add command',
  run: async (args: CommandArgs) => {
    const chainId = appToAddressBookId(args.chainId);
    await testChain(chainId, !!args.sample);
  },
};

async function testChain(chainId: AddressBookChainId, pickSamples: boolean) {
  const chainVaults = await getVaultsConfig(chainId);
  let clms = chainVaults.filter(
    vault => vault.type === 'cowcentrated' && vault.status === 'active'
  );
  if (!clms.length) {
    return true;
  }

  if (pickSamples) {
    clms = Object.values(groupBy(clms, 'tokenProviderId')).map(sample).flat().filter(isDefined);
  }

  // const clmAddresses = new Set(clms.map(clm => clm.earnContractAddress));
  // const pools = chainVaults.find(
  //   pool => pool.type === 'gov' && pool.tokenAddress && clmAddresses.has(pool.tokenAddress)
  // );
  // const vaults = chainVaults.find(
  //   vault => vault.type === 'standard' && vault.tokenAddress && clmAddresses.has(vault.tokenAddress)
  // );

  for (const clm of clms) {
    const success = await testAddClm(clm);
    if (success) {
      pConsole.success(clm.id);
    } else {
      pConsole.error(clm.id);
    }
    if (!(await shouldContinue(success))) {
      break;
    }
    console.log();
  }
}

async function shouldContinue(success: boolean) {
  const promises: Array<Promise<boolean>> = [confirm({ message: 'Continue?', default: true })];
  if (success) {
    promises.push(new Promise(resolve => setTimeout(() => resolve(true), 2000)));
  }
  return Promise.race(promises);
}

async function testAddClm(clm: VaultConfig) {
  const risks = clm.risks;
  if (!risks || risks.length === 0) {
    pConsole.warn(`Skipping CLM ${clm.id} as it has no risks`);
    return true;
  }

  const args: AddClmCommandArgs = {
    address: clm.earnContractAddress,
    chain: clm.network,
    dryRun: true,
    disableAutoFind: true,
    risks,
  };

  try {
    const { clm: clmFromCommand } = await addClmCommand(args);
    const result = compareConfigs(clmFromCommand, clm);
    if (!result.same) {
      pConsole.error(clm.id);
      console.table([
        ...result.changedKeys.map(k => ({ key: k, existing: clm[k], command: clmFromCommand[k] })),
        ...result.missingKeys.map(k => ({ key: k, existing: clm[k], command: '--missing--' })),
        ...result.extraKeys.map(k => ({
          key: k,
          existing: '--missing--',
          command: clmFromCommand[k],
        })),
      ]);
      return false;
    }
    return true;
  } catch (e) {
    pConsole.error(clm.id, e);
    return false;
  }
}

type CompareFunctions = {
  [K in keyof VaultConfig]?: (
    a: VaultConfig[K] | undefined,
    b: VaultConfig[K] | undefined
  ) => boolean;
};
const compareFunctions: CompareFunctions = {
  feeTier: (a, b) => {
    if (a === b) {
      return true;
    }
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    return !isNaN(aNum) && !isNaN(bNum) && aNum === bNum;
  },
};

function isKeyEqual(key: keyof VaultConfig, toCheck: VaultConfig, compareTo: VaultConfig) {
  const compareFn: typeof isEqual = compareFunctions[key] || isEqual;
  return compareFn(toCheck[key], compareTo[key]);
}

function compareConfigs(toCheck: VaultConfig, compareTo: VaultConfig) {
  const result = {
    same: true,
    missingKeys: [] as string[],
    changedKeys: [] as string[],
    extraKeys: [] as string[],
  };

  const keysToCheck = typedKeys(compareTo).filter(k => k !== 'createdAt');
  for (const key of keysToCheck) {
    if (!isKeyEqual(key, toCheck, compareTo)) {
      result.same = false;
      if (!(key in toCheck)) {
        result.missingKeys.push(key);
      } else {
        result.changedKeys.push(key);
      }
    }
  }

  const extraKeys = difference(Object.keys(toCheck), keysToCheck).filter(k => k !== 'createdAt');
  if (extraKeys.length) {
    result.same = false;
    result.extraKeys = extraKeys;
  }

  return result;
}

export default command;
