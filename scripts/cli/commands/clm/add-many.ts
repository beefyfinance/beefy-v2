import type { Command } from '../../types';
import { CommandArgs as AddCommandArgs } from './add';
import { CommandArgs as AddPoolCommandArgs } from './add-pool';
import { CommandArgs as AddVaultCommandArgs } from './add-vault';
import { loadJson } from '../../../common/files';
import { loadVaultsConfig } from '../../lib/config/vault';
import { pConsole } from '../../utils/console';
import { loadCommand } from '../../commands';
import { isDefined } from '../../utils/typeguards';

export type CommandArgs = {
  path: string;
  dryRun?: boolean;
};

const command: Command<CommandArgs> = {
  args: {
    path: {
      type: String,
      alias: 'p',
      description: 'Path to .json file',
      defaultOption: true,
    },
    dryRun: {
      optional: true,
      type: Boolean,
      description: 'Do not write the modified config file',
    },
  },
  description: 'Add many CLMs from a .json file\n\nSee add-many.example.json for format',
  run: async (args: CommandArgs) => {
    const configs = await loadJson<Array<AddCommandArgs>>(args.path);
    const addCommandConfig = await loadCommand<AddCommandArgs>('clm:add');
    const addPoolCommandConfig = await loadCommand<AddPoolCommandArgs>('clm:add-pool');
    const addVaultCommandConfig = await loadCommand<AddVaultCommandArgs>('clm:add-vault');
    const formatArgs = (args: Record<string, any>) => {
      return Object.entries(args)
        .map(([key, value]) => {
          if (value === undefined) {
            return undefined;
          }
          if (Array.isArray(value)) {
            return value.map(v => `--${key} ${v}`).join(' ');
          }
          return `--${key} ${value}`;
        })
        .filter(isDefined)
        .join(' ');
    };
    const addCommand = async (args: AddCommandArgs) => {
      pConsole.info(`yarn cli clm:add ${formatArgs(args)}`);
      await addCommandConfig.run(args);
    };
    const addPoolCommand = async (args: AddPoolCommandArgs) => {
      pConsole.info(`yarn cli clm:add-pool ${formatArgs(args)}`);
      await addPoolCommandConfig.run(args);
    };
    const addVaultCommand = async (args: AddVaultCommandArgs) => {
      pConsole.info(`yarn cli clm:add-vault ${formatArgs(args)}`);
      await addVaultCommandConfig.run(args);
    };

    for (const config of configs) {
      const existingVaults = await loadVaultsConfig(config.chain);
      const existingClm = config.address
        ? existingVaults.find(v => v.earnContractAddress === config.address)
        : undefined;
      const existingPool = config.pool
        ? existingVaults.find(v => v.earnContractAddress === config.pool)
        : undefined;
      const existingVault = config.vault
        ? existingVaults.find(v => v.earnContractAddress === config.vault)
        : undefined;

      if (config.address) {
        if (existingClm) {
          pConsole.info(`CLM already exists: ${existingClm.id} for ${config.address}`);
        } else {
          pConsole.info(`Add CLM ${config.address}`);
          await addCommand({
            ...config,
            dryRun: config.dryRun || args.dryRun,
          });
        }
      }
      if (config.pool) {
        if (existingPool) {
          pConsole.info(`CLM Pool already exists: ${existingPool.id} for ${config.pool}`);
        } else {
          pConsole.info(`Add CLM Pool ${config.vault}`);
          await addPoolCommand({
            address: config.pool,
            chain: config.chain,
            dryRun: config.dryRun || args.dryRun,
          });
        }
      }
      if (config.vault) {
        if (existingVault) {
          pConsole.info(`CLM Vault already exists: ${existingVault.id} for ${config.vault}`);
        } else {
          pConsole.info(`Add CLM Vault ${config.vault}`);
          await addVaultCommand({
            address: config.vault,
            chain: config.chain,
            dryRun: config.dryRun || args.dryRun,
          });
        }
      }
    }
  },
};

export default command;
